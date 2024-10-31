<script lang="ts">
	import { fetchUsers } from '$lib/users/api';
	import { onMount } from 'svelte';
	import { fetchInstructions } from '../../lib/instructions/api';
	import {
		createStep,
		deleteStep,
		fetchSteps,
		fetchStepsByInstructionId,
		updateStep
	} from '../../lib/steps/api';
	import type { Instruction, Step, User } from '../../lib/types';
	import { uploadFiles } from '$lib/uploadMultipleFiles';
	import Modal from '$lib/components/modals/Modal.svelte';

	let type: string = 'text';
	let title = '';
	let description = '';
	let stepNr: number = 1;
	let attachedFile = '';
	let instructionId: number | undefined = undefined;
	let createdBy: number | undefined = undefined;
	let updatedBy: number | undefined = undefined;
	let users: User[] = [];
	let steps: Step[] = [];
	let instructions: Instruction[] = [];
	let editStepId: number | null = null;
	let files: File[] = [];
	let uploadResults: any[] = [];
	let loading = false;

	onMount(async () => {
		steps = await fetchSteps();
		instructions = await fetchInstructions();
		users = await fetchUsers();
		if (users.length > 0) {
			if (createdBy === undefined || createdBy === null) createdBy = users[0].id;
			if (updatedBy === undefined || updatedBy === null) updatedBy = users[0].id;
		}
	});

	const checkAvailable = async (availableSteps: Step[]) => {
		if (instructionId === undefined) {
			alert('Please select a valid Instruction.');
			return;
		}
		const usedStepNumbers = availableSteps.map((step) => step.stepNr);
		let availableStepNr = 1;
		while (usedStepNumbers.includes(availableStepNr)) {
			availableStepNr++;
		}
		return availableStepNr;
	};

	$: if ((instructionId, steps)) {
		(async () => {
			if (!editStepId) {
				if (instructionId) {
					const nextStepNr = await checkAvailable(await fetchStepsByInstructionId(instructionId));
					if (nextStepNr) {
						stepNr = nextStepNr;
					} else {
						stepNr = 1;
					}
				} else {
					stepNr = 1;
				}
			}
		})();
	}

	const handleSave = async () => {
		if (instructionId === undefined) {
			alert('Please select a valid Instruction.');
			return;
		}

		if (editStepId === null) {
			updatedBy = createdBy;
		}
		loading = true;
		const stepData = {
			type,
			title,
			description,
			stepNr,
			attachedFile,
			instructionId,
			createdBy,
			updatedBy
		};

		if (editStepId === null) {
			if (type === 'text' && files[0]) {
				files = [];
				stepData.attachedFile = '';
			} else if (type !== 'text') {
				await handleUpload();
				stepData.attachedFile = uploadResults[0].url;
			}

			const newStep = await createStep(stepData);
			steps = [...steps, newStep];
		} else {
			//Edit Func
			if (files.length > 0) {
				// if (type === 'image' && !files[0].type.startsWith('image/')) {
				// 	alert('Please select an image file');
				// 			loading=false;
				// 	return;
				// }
				// if (type === 'video' && !files[0].type.startsWith('video/')) {
				// 	alert('Please select a video file');
				// 			loading=false;
				// 	return;
				// }
				// if (type === 'pdf' && !files[0].type.startsWith('application/')) {
				// 	alert('Please select a pdf file');
				// 			loading=false;
				// 	return;
				// }

				if (type === 'text' && files[0]) {
					files = [];
					stepData.attachedFile = '';
				} else {
					await handleUpload();
					stepData.attachedFile = uploadResults[0].url;
				}
			} else if (type === 'text') {
				stepData.attachedFile = '';
			}

			const updatedStep = await updateStep(editStepId, stepData);
			steps = steps.map((step) => (step.id === editStepId ? updatedStep : step));
			editStepId = null;
		}

		resetForm();

		toggleModal();
		loading = false;
	};

	const enableEdit = (step: Step) => {
		const fileInput = document.getElementById('attachedFile') as HTMLInputElement;
		if (fileInput) {
			fileInput.value = '';
		}
		editStepId = step.id;
		type = step.type;
		title = step.title;
		description = step.description;
		stepNr = step.stepNr;
		attachedFile = step.attachedFile || '';
		instructionId = step.instructionId;
		createdBy = step.createdBy;
		updatedBy = step.updatedBy;
		files = [];
		isModalOpen = true;
	};

	const handleDelete = async (id: number) => {
		let user = editStepId ? updatedBy : createdBy;
		const success = await deleteStep(id, user);
		if (success) {
			steps = steps.filter((step) => step.id !== id);

			if (editStepId === id) {
				editStepId = null;
				resetForm();
			}
		}
	};

	const resetForm = () => {
		type = 'text';
		title = '';
		description = '';
		stepNr = 1;
		attachedFile = '';
		instructionId = undefined;
		createdBy = users[0].id;
		updatedBy = users[0].id;
		files = [];
		uploadResults = [];
		loading = false;
	};

	const handleFileChange = (event: Event) => {
		const target = event.target as HTMLInputElement;
		if (target.files && target.files[0]) {
			const file = target.files[0];

			if (type === 'text') {
				alert('Text type does not accept file attachments');
				target.value = '';
				return;
			}

			if (type === 'image' && !file.type.startsWith('image/')) {
				alert('Please select an image file');
				target.value = '';
				return;
			}

			if (type === 'video' && !file.type.startsWith('video/')) {
				alert('Please select a video file');
				target.value = '';
				return;
			}

			if (type === 'pdf' && file.type !== 'application/pdf') {
				alert('Please select a PDF file');
				target.value = '';
				return;
			}

			files = [file];
		}
	};

	const handleUpload = async () => {
		if (files.length === 0) {
			alert('Please select files to upload');
			return;
		}
		uploadResults = await uploadFiles(files, 'images', '');
	};

	let searchQuery = '';
	$: filteredSteps = steps.filter(
		(step) =>
			step.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
			step.id.toString().includes(searchQuery.toLowerCase()) ||
			step.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
			step.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
			instructions
				.find((i) => i.id === step.instructionId)
				?.title.toLowerCase()
				.includes(searchQuery.toLowerCase())
	);

	let isModalOpen = false;

	function toggleModal() {
		isModalOpen = !isModalOpen;
		if (isModalOpen === false) {
			resetForm();
		}
	}

	let sortColumn = 'title';
	let sortOrder = 'asc';

	function sortData(column) {
		if (sortColumn === column) {
			sortOrder = sortOrder === 'asc' ? 'desc' : 'asc';
		} else {
			sortColumn = column;
			sortOrder = 'asc';
		}

		filteredSteps = [...filteredSteps].sort((a, b) => {
			let aValue = a[sortColumn];
			let bValue = b[sortColumn];

			// Convert dates to numbers for sorting
			if (sortColumn === 'createdAt' || sortColumn === 'updatedAt') {
				aValue = new Date(aValue).getTime();
				bValue = new Date(bValue).getTime();
			}

			if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
			if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
			return 0;
		});
	}
</script>

<div
	class="my-5 flex min-w-[50vw] max-w-[50vw] flex-col justify-start overflow-x-auto rounded-md bg-white p-3 px-10 shadow-md md:min-w-[70vw] md:max-w-[70vw] lg:min-w-[75vw] lg:max-w-[75vw] xl:min-w-[80vw] xl:max-w-[80vw]"
>
	<div class="my-2 flex flex-row items-center justify-between">
		<h1 class="text-3xl font-bold">List of Steps</h1>
	</div>

	{#if isModalOpen}
		<Modal
			isOpen={isModalOpen}
			closeModal={toggleModal}
			title={editStepId ? 'Edit Instruction' : 'Add Instruction'}
		>
			<form
				on:submit={handleSave}
				class="mx-auto mb-5 max-w-lg space-y-4 rounded-lg p-6 dark:bg-gray-800"
			>
				<div class="flex flex-col">
					<label for="title" class="font-medium text-gray-700 dark:text-gray-300">Title</label>
					<input
						id="title"
						bind:value={title}
						placeholder="Enter title"
						required
						class="mt-1 rounded-md border bg-gray-100 px-4 py-2 text-gray-800 focus:ring focus:ring-blue-200 dark:bg-gray-700 dark:text-gray-200"
					/>
				</div>

				<div class="flex flex-col">
					<label for="description" class="font-medium text-gray-700 dark:text-gray-300"
						>Description</label
					>
					<input
						id="description"
						bind:value={description}
						placeholder="Enter description"
						required
						class="mt-1 rounded-md border bg-gray-100 px-4 py-2 text-gray-800 focus:ring focus:ring-blue-200 dark:bg-gray-700 dark:text-gray-200"
					/>
				</div>

				<div class="flex flex-col">
					<label for="type" class="font-medium text-gray-700 dark:text-gray-300">Type</label>
					<select
						id="type"
						bind:value={type}
						required
						class="mt-1 rounded-md border bg-gray-100 px-4 py-2 text-gray-800 focus:ring focus:ring-blue-200 dark:bg-gray-700 dark:text-gray-200"
					>
						<option value="text">Text</option>
						<option value="image">Image</option>
						<option value="video">Video</option>
						<option value="pdf">PDF</option>
					</select>
				</div>
				{#if editStepId !== null && attachedFile}
					<div class="flex flex-col">
						<label class="font-medium text-gray-700 dark:text-gray-300">Current File</label>
						{#if ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'tiff', 'jfif'].includes(attachedFile
								.toLowerCase()
								.split('.')
								.pop())}
							<img src={attachedFile} alt="Current image" class="mt-2 h-auto w-12 rounded-md" />
						{:else if attachedFile.toLowerCase().endsWith('.mp4') || attachedFile
								.toLowerCase()
								.endsWith('.webm') || attachedFile.toLowerCase().endsWith('.mov')}
							<video
								src={attachedFile}
								class="mt-2 max-w-[200px] rounded-lg"
								preload="metadata"
								loop
								muted
							>
								<track kind="metadata" />
							</video>
						{:else if attachedFile.toLowerCase().endsWith('.pdf')}
							<div class="mt-2">
								<a
									href={attachedFile}
									target="_blank"
									class="text-blue-500 underline hover:text-blue-700"
								>
									View Current PDF
								</a>
							</div>
						{/if}
					</div>
				{/if}
				{#if type === 'image'}
					<div class="flex flex-col">
						<label for="imageFile" class="font-medium text-gray-700 dark:text-gray-300"
							>Image File</label
						>
						<input
							id="attachedFile"
							type="file"
							accept="image/*"
							required={(editStepId === null && type === 'image') ||
								(editStepId != null &&
									type === 'image' &&
									!attachedFile?.toLowerCase().endsWith('.jpg') &&
									!attachedFile?.toLowerCase().endsWith('.jpeg') &&
									!attachedFile?.toLowerCase().endsWith('.png') &&
									!attachedFile?.toLowerCase().endsWith('.gif'))}
							on:change={handleFileChange}
							class="mt-1 rounded-md border bg-gray-100 px-4 py-2 text-gray-800 focus:ring focus:ring-blue-200 dark:bg-gray-700 dark:text-gray-200"
						/>
					</div>
				{/if}

				{#if type === 'video'}
					<div class="flex flex-col">
						<label for="videoFile" class="font-medium text-gray-700 dark:text-gray-300"
							>Video File</label
						>
						<input
							required={(editStepId === null && type === 'video') ||
								(editStepId !== null &&
									type === 'video' &&
									!attachedFile?.toLowerCase().endsWith('.mp4') &&
									!attachedFile?.toLowerCase().endsWith('.webm') &&
									!attachedFile?.toLowerCase().endsWith('.mov'))}
							id="attachedFile"
							type="file"
							accept="video/*"
							on:change={handleFileChange}
							class="mt-1 rounded-md border bg-gray-100 px-4 py-2 text-gray-800 focus:ring focus:ring-blue-200 dark:bg-gray-700 dark:text-gray-200"
						/>
					</div>
				{/if}

				{#if type === 'pdf'}
					<div class="flex flex-col">
						<label for="pdfFile" class="font-medium text-gray-700 dark:text-gray-300"
							>PDF File</label
						>
						<input
							required={(editStepId === null && type === 'pdf') ||
								(editStepId !== null &&
									type === 'pdf' &&
									!attachedFile?.toLowerCase().endsWith('.pdf'))}
							id="attachedFile"
							type="file"
							accept="application/pdf"
							on:change={handleFileChange}
							class="mt-1 rounded-md border bg-gray-100 px-4 py-2 text-gray-800 focus:ring focus:ring-blue-200 dark:bg-gray-700 dark:text-gray-200"
						/>
					</div>
				{/if}

				{#if editStepId === null}
					<div class="flex flex-col">
						<label for="createdBy" class="font-medium text-gray-700 dark:text-gray-300"
							>Current User</label
						>
						<select
							id="createdBy"
							bind:value={createdBy}
							required
							class="mt-1 rounded-md border bg-gray-100 px-4 py-2 text-gray-800 focus:ring focus:ring-blue-200 dark:bg-gray-700 dark:text-gray-200"
						>
							{#each users as user}
								<option value={user.id}>{user.name}</option>
							{/each}
						</select>
					</div>
				{:else}
					<div class="flex flex-col">
						<label for="updatedBy" class="font-medium text-gray-700 dark:text-gray-300"
							>Current User</label
						>
						<select
							id="updatedBy"
							bind:value={updatedBy}
							required
							class="mt-1 rounded-md border bg-gray-100 px-4 py-2 text-gray-800 focus:ring focus:ring-blue-200 dark:bg-gray-700 dark:text-gray-200"
						>
							{#each users as user}
								<option value={user.id}>{user.name}</option>
							{/each}
						</select>
					</div>
				{/if}

				<div class="flex flex-col">
					<label for="instructionId" class="font-medium text-gray-700 dark:text-gray-300"
						>Select Instruction</label
					>
					<select
						id="instructionId"
						bind:value={instructionId}
						required
						class="mt-1 rounded-md border bg-gray-100 px-4 py-2 text-gray-800 focus:ring focus:ring-blue-200 dark:bg-gray-700 dark:text-gray-200"
					>
						<option value={undefined} disabled>Select Instruction</option>
						{#each instructions as instruction}
							<option value={instruction.id}>{instruction.title}</option>
						{/each}
					</select>
				</div>

				<div class="flex flex-col">
					<label for="stepNr" class="font-medium text-gray-700 dark:text-gray-300"
						>Step Number</label
					>
					<input
						id="stepNr"
						type="number"
						disabled
						bind:value={stepNr}
						placeholder="Step Number"
						required
						class="mt-1 rounded-md border bg-gray-100 px-4 py-2 text-gray-800 focus:ring focus:ring-blue-200 dark:bg-gray-700 dark:text-gray-200"
					/>
				</div>

				<button
					type="submit"
					disabled={loading}
					class="w-full rounded-md bg-blue-500 px-4 py-2 font-semibold text-white transition hover:bg-blue-600 focus:outline-none focus:ring focus:ring-blue-300 disabled:cursor-not-allowed disabled:opacity-50"
				>
					{editStepId === null ? 'Create Step' : 'Update Step'}
				</button>
			</form>
		</Modal>
	{/if}

	<div class="">
		<div class="my-4 flex flex-row items-center justify-between">
			<div class="relative -z-0 mb-2 w-full max-w-xs">
				<span class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
					<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"
						><rect width="24" height="24" fill="none" /><path
							fill="currentColor"
							d="M15.5 14h-.79l-.28-.27A6.47 6.47 0 0 0 16 9.5A6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5S14 7.01 14 9.5S11.99 14 9.5 14"
						/></svg
					>
				</span>
				<input
					type="text"
					bind:value={searchQuery}
					placeholder="Search..."
					class="w-full rounded-md border border-gray-200 bg-slate-50 py-2 pl-10 pr-4 text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
				/>
			</div>
			<button
				on:click={toggleModal}
				class="rounded-lg bg-green-500 px-5 py-3 text-sm font-semibold text-white"
			>
				Create New Step
			</button>
		</div>

		<!-- Steps Table -->
		<div
			class="overflow-x-auto rounded-lg bg-white
		 [&::-webkit-scrollbar]:h-0
		"
		>
			<table class="min-w-full bg-white dark:bg-gray-800">
				<thead class="select-none border-b-2 border-b-indigo-800">
					<tr>
						<th
							class="cursor-pointer text-nowrap px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-black dark:text-gray-300"
							on:click={() => sortData('title')}
						>
							Title {sortColumn === 'title' ? (sortOrder === 'asc' ? '🠉' : '🠋') : ''}
						</th>
						<th
							class="cursor-pointer text-nowrap px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-black dark:text-gray-300"
							on:click={() => sortData('description')}
						>
							Description {sortColumn === 'description' ? (sortOrder === 'asc' ? '🠉' : '🠋') : ''}
						</th>
						<th
							class="cursor-pointer text-nowrap px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-black dark:text-gray-300"
							on:click={() => sortData('createdBy')}
						>
							Created By {sortColumn === 'createdBy' ? (sortOrder === 'asc' ? '🠉' : '🠋') : ''}
						</th>
						<th
							class="cursor-pointer text-nowrap px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-black dark:text-gray-300"
							on:click={() => sortData('updatedBy')}
						>
							Updated By {sortColumn === 'updatedBy' ? (sortOrder === 'asc' ? '🠉' : '🠋') : ''}
						</th>
						<th
							class="cursor-pointer text-nowrap px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-black dark:text-gray-300"
							on:click={() => sortData('createdAt')}
						>
							Created At {sortColumn === 'createdAt' ? (sortOrder === 'asc' ? '🠉' : '🠋') : ''}
						</th>
						<th
							class="cursor-pointer text-nowrap px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-black dark:text-gray-300"
							on:click={() => sortData('updatedAt')}
						>
							Updated At {sortColumn === 'updatedAt' ? (sortOrder === 'asc' ? '🠉' : '🠋') : ''}
						</th>
						<th
							class="cursor-pointer text-nowrap px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-black dark:text-gray-300"
							on:click={() => sortData('instructionId')}
						>
							Instruction {sortColumn === 'instructionId' ? (sortOrder === 'asc' ? '🠉' : '🠋') : ''}
						</th>
						<th
							class="cursor-pointer text-nowrap px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-black dark:text-gray-300"
							on:click={() => sortData('type')}
						>
							Type {sortColumn === 'type' ? (sortOrder === 'asc' ? '🠉' : '🠋') : ''}
						</th>
						<th
							class="text-nowrap px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-black dark:text-gray-300"
						>
							File
						</th>
						<th
							class="text-nowrap px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-black dark:text-gray-300"
						>
							Actions
						</th>
					</tr>
				</thead>
				<tbody>
					{#each filteredSteps as step (step.id)}
						<tr class="odd:bg-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700">
							<td class="whitespace-nowrap px-6 py-4 text-sm text-gray-800 dark:text-gray-200"
								>{step.title}</td
							>
							<td
								class=" truncate whitespace-nowrap px-6 py-4 text-sm text-gray-800 dark:text-gray-200"
								>{step.description}</td
							>
							<td class="whitespace-nowrap px-6 py-4 text-sm text-gray-800 dark:text-gray-200">
								{users.find((user) => user.id === step.createdBy)?.name}
							</td>
							<td class="whitespace-nowrap px-6 py-4 text-sm text-gray-800 dark:text-gray-200">
								{users.find((user) => user.id === step.updatedBy)?.name}
							</td>
							<td class="whitespace-nowrap px-6 py-4 text-sm text-gray-800 dark:text-gray-200">
								{new Date(step.createdAt).toLocaleDateString()}
							</td>
							<td class="whitespace-nowrap px-6 py-4 text-sm text-gray-800 dark:text-gray-200">
								{new Date(step.updatedAt).toLocaleDateString()}
							</td>
							<td class="whitespace-nowrap px-6 py-4 text-sm text-gray-800 dark:text-gray-200">
								{instructions.find((instruction) => instruction.id === step.instructionId)?.title}
							</td>
							<td class="whitespace-nowrap px-6 py-4 text-sm text-gray-800 dark:text-gray-200">
								{step.type}
							</td>

							<td class="whitespace-nowrap px-6 py-4 text-sm text-gray-800 dark:text-gray-200">
								{#if step.type === 'video' && step.attachedFile}
									<a href={step.attachedFile} target="_blank">
										<video src={step.attachedFile} class="" preload="metadata" loop muted>
											<track kind="metadata" />
										</video>
									</a>
								{:else if step.type === 'pdf' && step.attachedFile}
									<a
										href={step.attachedFile}
										target="_blank"
										class="text-blue-500 hover:text-blue-700"
									>
										PDF
									</a>
								{:else if step.type === 'image' && step.attachedFile}
									<a
										href={step.attachedFile}
										target="_blank"
										class="inline-block h-auto w-12 text-blue-500 hover:text-blue-700"
									>
										<img src={step.attachedFile} alt="File" class=" " />
									</a>
								{:else}
									-
								{/if}
							</td>

							<td class="whitespace-nowrap px-6 py-4 text-sm text-gray-800 dark:text-gray-200">
								<button
									on:click={() => enableEdit(step)}
									class="mr-2 rounded bg-blue-500 px-3 py-1 text-white transition hover:bg-blue-600"
								>
									<svg
										xmlns="http://www.w3.org/2000/svg"
										width="1em"
										height="1em"
										viewBox="0 0 24 24"
										><rect width="24" height="24" fill="none" /><path
											fill="currentColor"
											d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75zM20.71 7.04a.996.996 0 0 0 0-1.41l-2.34-2.34a.996.996 0 0 0-1.41 0l-1.83 1.83l3.75 3.75z"
										/></svg
									>
								</button>
								<button
									on:click={() => handleDelete(step.id)}
									class="rounded bg-red-500 px-3 py-1 text-white transition hover:bg-red-600"
								>
									<svg
										xmlns="http://www.w3.org/2000/svg"
										width="1em"
										height="1em"
										viewBox="0 0 24 24"
										><rect width="24" height="24" fill="none" /><path
											fill="currentColor"
											d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6zM19 4h-3.5l-1-1h-5l-1 1H5v2h14z"
										/></svg
									>
								</button>
							</td>
						</tr>
					{:else}
						<tr>
							<td colspan="8" class="px-6 py-4 text-center text-gray-500 dark:text-gray-300"
								>No Steps found</td
							>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</div>
</div>
<!-- <div class="search-container">
	<input 
		type="text"
		placeholder="Search instructions..."
		bind:value={searchQuery}
	/>
</div>
<ul>
	{#each filteredSteps as step}
		<li>
			<h2 class={editStepId === step.id ? 'editing' : ''}>{step.title}</h2>
			{#if step.type === 'image' && step.attachedFile}
				<a href={step.attachedFile} target="_blank" rel="noopener noreferrer">
					<img 
						src={step.attachedFile} 
						height="50px" 
						width="50px" 
						style="margin-right: 30px;"
						alt={step.title}
					/>
				</a>
			{:else if step.type === 'video' && step.attachedFile}
				<a href={step.attachedFile} target="_blank" rel="noopener noreferrer">
					<video
						src={step.attachedFile}
						height="50px"
						width="50px" 
						style="margin-right: 30px;"
						autoplay
						muted
						loop
					/>
				</a>
			{:else if step.type === 'pdf' && step.attachedFile}
				<a href={step.attachedFile} target="_blank" rel="noopener noreferrer" style="margin-right: 30px;" title="Document file">
					<svg xmlns="http://www.w3.org/2000/svg" width="3em" height="3em" viewBox="0 0 32 32"><g fill="none"><path fill="url(#fluentColorDocument320)" d="M17 2H8a3 3 0 0 0-3 3v22a3 3 0 0 0 3 3h16a3 3 0 0 0 3-3V12l-7-3z"/><path fill="url(#fluentColorDocument322)" fill-opacity="0.5" d="M17 2H8a3 3 0 0 0-3 3v22a3 3 0 0 0 3 3h16a3 3 0 0 0 3-3V12l-7-3z"/><path fill="url(#fluentColorDocument321)" d="M17 10V2l10 10h-8a2 2 0 0 1-2-2"/><defs><linearGradient id="fluentColorDocument320" x1="20.4" x2="22.711" y1="2" y2="25.61" gradientUnits="userSpaceOnUse"><stop stop-color="#6ce0ff"/><stop offset="1" stop-color="#4894fe"/></linearGradient><linearGradient id="fluentColorDocument321" x1="21.983" x2="19.483" y1="6.167" y2="10.333" gradientUnits="userSpaceOnUse"><stop stop-color="#9ff0f9"/><stop offset="1" stop-color="#b3e0ff"/></linearGradient><radialGradient id="fluentColorDocument322" cx="0" cy="0" r="1" gradientTransform="rotate(133.108 13.335 7.491)scale(17.438 10.2853)" gradientUnits="userSpaceOnUse"><stop offset=".362" stop-color="#4a43cb"/><stop offset="1" stop-color="#4a43cb" stop-opacity="0"/></radialGradient></defs></g></svg>
				</a>
			{/if}
			<button on:click={() => enableEdit(step)}>Edit</button>
			<button on:click={() => handleDelete(step.id)}>Delete</button>
		</li>
	{/each}
</ul> -->
