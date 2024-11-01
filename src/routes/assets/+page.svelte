<script lang="ts">
	import Modal from '$lib/components/modals/Modal.svelte';
	import { uploadFiles } from '$lib/uploadMultipleFiles';
	import { fetchUsers } from '$lib/users/api';
	import { onMount } from 'svelte';
	import { createAsset, deleteAsset, fetchAssets, updateAsset } from '../../lib/assets/api';
	import type { Asset, User } from '../../lib/types';
	let files: File[] = [];
	let uploadResults: any[] = [];
	let loading = false;
	let name = '';
	let assetFiles: any = []; // Treat as a string for input
	let createdBy: number | undefined = undefined;
	let updatedBy: number | undefined = undefined;
	let users: User[] = [];
	let assets: Asset[] = [];
	let editAssetId: number | null = null;

	onMount(async () => {
		assets = await fetchAssets();
		users = await fetchUsers();
		if (users.length > 0) {
			if (createdBy === undefined || createdBy === null) createdBy = users[0].id;
			if (updatedBy === undefined || updatedBy === null) updatedBy = users[0].id;
		}
	});

	const handleSave = async () => {
		if (!createdBy) {
			alert('Please select a creator.');
			loading = false;
			return;
		}
		loading = true;
		if (editAssetId === null) {
			if (files.length <= 0) {
				alert('Please select a file to upload');
				loading = false;
				return;
			}

			await handleUpload();
			const assetData = {
				name,
				assetFiles: uploadResults.length > 0 ? uploadResults.map((i) => i.url) : [],
				createdBy,
				updatedBy
			};
			assetData.updatedBy = assetData.createdBy;
			const newAsset = await createAsset(assetData);

			assets = [...assets, newAsset];
		} else {
			if (files.length > 0) {
				await handleUpload();
			}
			const assetData = {
				name,
				assetFiles: uploadResults.length > 0 ? uploadResults.map((i) => i.url) : assetFiles,
				createdBy,
				updatedBy
			};
			const updatedAsset = await updateAsset(editAssetId, assetData);
			assets = assets.map((asset) => (asset.id === editAssetId ? updatedAsset : asset));
			editAssetId = null;
		}
		loading = false;
		isModalOpen = false;
		const fileInput = document.getElementById('assetFiles') as HTMLInputElement;
		if (fileInput) {
			fileInput.value = '';
		}
		resetForm();
	};

	const enableEdit = (asset: Asset) => {
		const fileInput = document.getElementById('assetFiles') as HTMLInputElement;
		if (fileInput) {
			fileInput.value = '';
		}
		editAssetId = asset.id;
		name = asset.name;
		assetFiles = asset.assetFiles;
		createdBy = asset.createdBy;
		updatedBy = asset.updatedBy;
		files = [];
		isModalOpen = true;
	};

	const handleFileChange = (event: Event) => {
		const target = event.target as HTMLInputElement;
		if (target.files) {
			const selectedFiles = Array.from(target.files);

			// Check if any file is larger than 10MB
			const MAX_SIZE = 10 * 1024 * 1024; // 10MB in bytes
			const oversizedFiles = selectedFiles.filter((file) => file.size > MAX_SIZE);

			if (oversizedFiles.length > 0) {
				alert('Files must be smaller than 10MB');
				target.value = ''; // Clear the file input
				return;
			}

			// Check if more than 10 files selected
			if (selectedFiles.length > 10) {
				alert('Maximum 10 files allowed');
				target.value = ''; // Clear the file input
				return;
			}

			files = selectedFiles;
		}
	};

	const handleUpload = async () => {
		if (files.length === 0) {
			alert('Please select files to upload');
			return;
		}

		uploadResults = await uploadFiles(files, 'images', '');
		console.log('🚀 ~ handleUpload ~ uploadResults:', uploadResults);
	};

	const handleDelete = async (id: number) => {
		let user = editAssetId ? updatedBy : createdBy;
		try {
			const success = await deleteAsset(id, user);
			if (success) {
				assets = assets.filter((instruction) => instruction.id !== id);
				if (editAssetId === id) {
					editAssetId = null;
					resetForm();
				}
			}
		} catch (error) {
			if (error instanceof Error) {
				alert(`Error: ${error.message}`);
			} else {
				alert('An unexpected error occurred.');
			}
		}
	};

	const resetForm = () => {
		name = '';
		assetFiles = [];
		createdBy = users[0].id;
		updatedBy = users[0].id;
		files = [];
		uploadResults = [];
		loading = false;
	};

	let searchQuery = '';
	$: filteredAssets = assets.filter(
		(asset) =>
			asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
			asset.id.toString().includes(searchQuery.toLowerCase()) ||
			asset.assetFiles.some((file) => file.toLowerCase().includes(searchQuery.toLowerCase()))
	);

	let isModalOpen = false;

	function toggleModal() {
		isModalOpen = !isModalOpen;
		if (isModalOpen === false) {
			resetForm();
		}
	}

	let sortColumn = '';
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

	let currFiles = [];
	let filesModal = false;
	$: {
		console.log(currFiles);
		console.log(filesModal);
	}
</script>

<div
	class="my-5 flex min-w-[50vw] max-w-[50vw] flex-col justify-start overflow-x-auto rounded-md bg-white p-3 px-10 shadow-md md:min-w-[70vw] md:max-w-[70vw] lg:min-w-[75vw] lg:max-w-[75vw] xl:min-w-[80vw] xl:max-w-[80vw]"
>
	<div class="my-2 flex flex-row items-center justify-between">
		<h1 class="text-3xl font-bold">List of Assets</h1>
	</div>

	{#if isModalOpen}
		<Modal
			isOpen={isModalOpen}
			closeModal={toggleModal}
			title={editAssetId ? 'Edit Asset' : 'Add Asset'}
		>
			<form
				on:submit|preventDefault={handleSave}
				class="mx-auto mb-5 flex max-w-lg flex-col space-y-4 rounded-lg p-6"
			>
				<div class="flex flex-col">
					<label for="name" class="font-medium text-gray-700">Asset Name</label>
					<input
						id="name"
						bind:value={name}
						placeholder="Asset Name"
						required
						class="mt-1 rounded-md border bg-gray-100 px-4 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400"
					/>
				</div>

				<div class="flex flex-col">
					<label for="assetFiles" class="font-medium text-gray-700">Select Files</label>
					<input
						id="assetFiles"
						type="file"
						multiple
						on:change={handleFileChange}
						class="mt-1 rounded-md border bg-gray-100 px-4 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400"
					/>
				</div>

				{#if editAssetId === null}
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

				<button
					type="submit"
					disabled={loading}
					class="w-full rounded-md bg-blue-500 px-4 py-2  text-white transition hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:cursor-not-allowed disabled:opacity-50"
				>
					{editAssetId === null ? 'Create Asset' : 'Update Asset'}
				</button>
			</form>
		</Modal>
	{/if}

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
		<button on:click={toggleModal} class="rounded-lg bg-green-500 px-5 py-3 text-sm text-white font-semibold">
			Create New Asset
		</button>
	</div>
	{#if currFiles.length > 0 && filesModal}
		<Modal
			isOpen={filesModal}
			closeModal={() => {
				currFiles = [];
				filesModal = false;
			}}
			title="Current Files"
		>
			<div class="p-6">
				<ul class="space-y-2">
					{#each currFiles as file}
						<li
							class="flex items-center justify-between space-x-2 rounded p-2 "
						>
							<div class="flex items-center space-x-2">
								{#if file.toLowerCase().endsWith('.pdf')}
									<span class="rounded bg-red-100 px-2 py-1 text-xs  text-red-800"
										>PDF</span
									>
									<iframe src={file} title="PDF Document" class="h-96 w-full" />
								{:else if file.toLowerCase().endsWith('.jpg') || file
										.toLowerCase()
										.endsWith('.jpeg') || file.toLowerCase().endsWith('.png') || file
										.toLowerCase()
										.endsWith('.gif')}
									<span class="rounded bg-blue-100 px-2 py-1 text-xs  text-blue-800"
										>Image</span
									>
									<img src={file} alt="file" class="h-auto max-w-[350px]" />
								{:else if file.toLowerCase().endsWith('.mp4') || file
										.toLowerCase()
										.endsWith('.webm')}
									<span
										class="rounded bg-purple-100 px-2 py-1 text-xs  text-purple-800"
										>Video</span
									>
									<video src={file} controls class="max-w-[350px]">
										<track kind="captions" srclang="en" label="English" />
									</video>
								{:else}
									<span class="rounded bg-gray-100 px-2 py-1 text-xs  text-gray-800"
										>File</span
									>
									<a
										href={file}
										target="_blank"
										rel="noopener noreferrer"
										class="break-all text-gray-700 hover:text-blue-600 dark:text-gray-200 dark:hover:text-blue-400"
									>
										{file.split('/').pop()}
									</a>
								{/if}
							</div>
						</li>
					{/each}
				</ul>
			</div>
		</Modal>
	{/if}

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
						on:click={() => sortData('id')}
					>
						ID {sortColumn === 'id' ? (sortOrder === 'asc' ? '🠉' : '🠋') : ''}
					</th>
					<th
						class="cursor-pointer text-nowrap px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-black dark:text-gray-300"
						on:click={() => sortData('name')}
					>
						Name {sortColumn === 'name' ? (sortOrder === 'asc' ? '🠉' : '🠋') : ''}
					</th>
					<th
						class="text-nowrap px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-black dark:text-gray-300"
					>
						Created By
					</th>
					<th
						class="text-nowrap px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-black dark:text-gray-300"
					>
						Updated By
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
						class="text-nowrap px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-black dark:text-gray-300"
					>
						Files
					</th>
					<th
						class="text-nowrap px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-black dark:text-gray-300"
					>
						Actions
					</th>
				</tr>
			</thead>
			<tbody>
				{#each filteredAssets as asset}
					<tr class="odd:bg-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700">
						<td
							class="whitespace-nowrap px-6 py-4 text-sm  text-gray-800 dark:text-gray-200"
						>
							{asset.id}
						</td>
						<td
							class="whitespace-nowrap px-6 py-4 text-sm  text-gray-800 dark:text-gray-200"
						>
							{asset.name}
						</td>
						<td
							class="whitespace-nowrap px-6 py-4 text-sm  text-gray-800 dark:text-gray-200"
						>
							{users.find((user) => user.id === asset.createdBy)?.name}
						</td>
						<td
							class="whitespace-nowrap px-6 py-4 text-sm  text-gray-800 dark:text-gray-200"
						>
							{users.find((user) => user.id === asset.updatedBy)?.name}
						</td>
						<td
							class="whitespace-nowrap px-6 py-4 text-sm  text-gray-800 dark:text-gray-200"
						>
							{new Date(asset.createdAt).toLocaleDateString()}
						</td>
						<td
							class="whitespace-nowrap px-6 py-4 text-sm  text-gray-800 dark:text-gray-200"
						>
							{new Date(asset.updatedAt).toLocaleDateString()}
						</td>
						<td
							class="whitespace-nowrap px-6 py-4 text-sm  text-gray-800 dark:text-gray-200"
						>
							<button
								on:click={() => {
									currFiles = asset.assetFiles;
									filesModal = true;
								}}
								class="rounded bg-green-500 px-3 py-1 text-white transition hover:bg-green-600"
							>
								Files
							</button>
						</td>
						<td
							class="whitespace-nowrap px-6 py-4 text-sm  text-gray-800 dark:text-gray-200"
						>
							<button
								on:click={() => enableEdit(asset)}
								class="mr-2 rounded bg-blue-500 px-3 py-1 text-white transition hover:bg-blue-600"
							>
								<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"
									><rect width="24" height="24" fill="none" /><path
										fill="currentColor"
										d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75zM20.71 7.04a.996.996 0 0 0 0-1.41l-2.34-2.34a.996.996 0 0 0-1.41 0l-1.83 1.83l3.75 3.75z"
									/></svg
								>
							</button>
							<button
								on:click={() => handleDelete(asset.id)}
								class="rounded bg-red-500 px-3 py-1 text-white transition hover:bg-red-600"
							>
								<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"
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
						<td colspan="8" class="px-6 py-4 text-center text-gray-500 dark:text-gray-300">
							No Assets found
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</div>
