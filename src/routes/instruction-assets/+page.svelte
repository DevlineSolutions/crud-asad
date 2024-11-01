<script lang="ts">
	import { onMount } from 'svelte';
	import {
		fetchInstructionAssets,
		createInstructionAsset,
		deleteInstructionAsset
	} from '$lib/instructionAssets/api';
	import { fetchInstructions } from '$lib/instructions/api';
	import { fetchAssets } from '$lib/assets/api';
	import type { Instruction, Asset, InstructionAsset } from '$lib/types';
	import Modal from '$lib/components/modals/Modal.svelte';
	let instructionId: number | undefined = undefined;
	let assetId: number | undefined = undefined;
	let instructionAssets: InstructionAsset[] = [];
	let instructions: Instruction[] = [];
	let assets: Asset[] = [];

	onMount(async () => {
		instructionAssets = await fetchInstructionAssets();
		instructions = await fetchInstructions();
		assets = await fetchAssets();
	});

	const handleSave = async () => {
		if (instructionId === undefined || assetId === undefined) {
			alert('Please select both Instruction and Asset.');
			return;
		}

		const newInstructionAsset = await createInstructionAsset({ instructionId, assetId });

		if (newInstructionAsset === false) {
			alert('Already exists a relationship between this Instruction and Asset.');
		} else {
			instructionAssets = [...instructionAssets, newInstructionAsset];
			resetForm();
		}
	};

	const handleDelete = async (instructionId: number, assetId: number) => {
		const success = await deleteInstructionAsset(instructionId, assetId);
		if (success) {
			instructionAssets = instructionAssets.filter(
				(ia) => ia.instructionId !== instructionId || ia.assetId !== assetId
			);
		}
	};

	const resetForm = () => {
		instructionId = undefined;
		assetId = undefined;
		isModalOpen=false;
	};
	let searchQuery = "";
	$: filtered = instructionAssets.filter((asset) =>
		asset.instructionId.toString().toLowerCase().includes(searchQuery.toLowerCase()) 
		|| asset.assetId.toString().toLowerCase().includes(searchQuery.toLowerCase())
		|| assets.find((a) => a.id === asset.assetId)?.name.toLowerCase().includes(searchQuery.toLowerCase())
		|| instructions.find((i) => i.id === asset.instructionId)?.title.toLowerCase().includes(searchQuery.toLowerCase())
	);


	let isModalOpen = false;

function toggleModal() {
  isModalOpen = !isModalOpen;
  if(isModalOpen===false){
	resetForm();
  }
}


let sortColumn = "";
  let sortOrder = "asc";

  function sortData(column) {
    if (sortColumn === column) {
      sortOrder = sortOrder === "asc" ? "desc" : "asc";
    } else {
      sortColumn = column;
      sortOrder = "asc";
    }

    filtered = [...filtered].sort((a, b) => {
      let aValue = a[sortColumn];
      let bValue = b[sortColumn];

      // Convert dates to numbers for sorting
      if (sortColumn === "createdAt" || sortColumn === "updatedAt") {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      }

      if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
      if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });
  }





</script>
<div class="flex flex-col justify-start min-w-[50vw] max-w-[50vw] md:min-w-[70vw]  md:max-w-[70vw] lg:min-w-[75vw] lg:max-w-[75vw] xl:min-w-[80vw] xl:max-w-[80vw]  bg-white rounded-md shadow-md p-3 px-10 overflow-x-auto my-5">
	<div class="flex flex-row justify-between items-center my-2">
	<h1 class="text-3xl font-bold">Instruction Assets</h1>
	
	</div>  
	

{#if isModalOpen}
<Modal isOpen={isModalOpen} closeModal={toggleModal} title={"Add Instruction Asset"}>
	<form on:submit|preventDefault={handleSave} class="flex flex-col max-w-lg mx-auto p-6 mb-5 rounded-lg space-y-4">
		<div class="flex flex-col">
			<label for="instructionId" class="text-gray-700 font-medium">Select Instruction</label>
			<select 
				id="instructionId" 
				bind:value={instructionId} 
				required 
				class="mt-1 px-4 py-2 border rounded-md bg-gray-100 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400"
			>
				<option value={undefined} disabled>Select Instruction</option>
				{#each instructions as instruction}
					<option value={instruction.id}>{instruction.title}</option>
				{/each}
			</select>
		</div>

		<div class="flex flex-col">
			<label for="assetId" class="text-gray-700 font-medium">Select Asset</label>
			<select 
				id="assetId" 
				bind:value={assetId} 
				required 
				class="mt-1 px-4 py-2 border rounded-md bg-gray-100 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400"
			>
				<option value={undefined} disabled>Select Asset</option>
				{#each assets as asset}
					<option value={asset.id}>{asset.name}</option>
				{/each}
			</select>
		</div>

		<button 
			type="submit" 
			class="w-full px-4 py-2 font-semibold text-white bg-blue-500 rounded-md hover:bg-blue-600 transition focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-50 disabled:cursor-not-allowed"
		>
			Create Relationship
		</button>
	</form>
</Modal>
{/if}

<div class="flex flex-row justify-between my-4 items-center">
	<div class="relative -z-0 w-full max-w-xs mb-2 ">
		<span class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
			<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><rect width="24" height="24" fill="none"/><path fill="currentColor" d="M15.5 14h-.79l-.28-.27A6.47 6.47 0 0 0 16 9.5A6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5S14 7.01 14 9.5S11.99 14 9.5 14"/></svg>
		</span>
		<input
		  type="text"
		  bind:value={searchQuery}
		  placeholder="Search..."
		  class="pl-10 pr-4 py-2 w-full rounded-md bg-slate-50 text-black border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
		/>
	</div>
	<button on:click={toggleModal} class="px-5 py-3 text-sm bg-green-500 text-white rounded-lg font-semibold">
		Create New Instruction Asset
	</button>
</div>


	<div class="overflow-x-auto bg-white rounded-lg 
	 [&::-webkit-scrollbar]:h-0
">
<table class="min-w-full bg-white dark:bg-gray-800">
	<thead class="border-b-2 border-b-indigo-800 select-none">
		<tr>
			<th
				class="px-6 py-3 text-left text-xs font-medium text-black dark:text-gray-300 uppercase text-nowrap tracking-wider cursor-pointer"
				on:click={() => sortData("instructionId")}
			>
				Instruction ID {sortColumn === "instructionId" ? (sortOrder === "asc" ? "🠉" : "🠋") : ""}
			</th>
			<th
				class="px-6 py-3 text-left text-xs font-medium text-black dark:text-gray-300 uppercase text-nowrap tracking-wider cursor-pointer"
				on:click={() => sortData("assetId")}
			>
				Asset ID {sortColumn === "assetId" ? (sortOrder === "asc" ? "🠉" : "🠋") : ""}
			</th>
			<th
				class="px-6 py-3 text-left text-xs font-medium text-black dark:text-gray-300 uppercase text-nowrap tracking-wider cursor-pointer"
			>
				Instruction name 
			</th>
			<th
				class="px-6 py-3 text-left text-xs font-medium text-black dark:text-gray-300 uppercase text-nowrap tracking-wider cursor-pointer"
				
			>
				Asset name
			</th>
			<th class="px-6 py-3 text-left text-xs font-medium text-black dark:text-gray-300 uppercase text-nowrap tracking-wider">
				Actions
			</th>
		</tr>
	</thead>
	<tbody>
		{#each filtered as instructionAsset}
			<tr class="hover:bg-gray-100 odd:bg-gray-100 dark:hover:bg-gray-700">
				<td class="px-6 py-4 whitespace-nowrap text-sm  text-gray-800 dark:text-gray-200">
					{instructionAsset.instructionId}
				</td>
				<td class="px-6 py-4 whitespace-nowrap text-sm  text-gray-800 dark:text-gray-200">
					{instructionAsset.assetId}
				</td>
				<td class="px-6 py-4 whitespace-nowrap text-sm  text-gray-800 dark:text-gray-200">
					{instructions.find((a) => a.id === instructionAsset.instructionId)?.title}
				</td>
				<td class="px-6 py-4 whitespace-nowrap text-sm  text-gray-800 dark:text-gray-200">
					{assets.find((a) => a.id === instructionAsset.assetId)?.name}
				</td>
				<td class="px-6 py-4 whitespace-nowrap text-sm  text-gray-800 dark:text-gray-200">
					<button
						on:click={() => handleDelete(instructionAsset.instructionId, instructionAsset.assetId)}
						class="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition"
					>
						<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><rect width="24" height="24" fill="none"/><path fill="currentColor" d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6zM19 4h-3.5l-1-1h-5l-1 1H5v2h14z"/></svg>
					</button>
				</td>
			</tr>
		{:else}
			<tr>
				<td colspan="3" class="px-6 py-4 text-center text-gray-500 dark:text-gray-300">No Instruction Assets found</td>
			</tr>
		{/each}
	</tbody>
</table>
</div>



</div>