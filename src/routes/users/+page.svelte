<script lang="ts">
	import { onMount } from 'svelte';
	import { fetchUsers, createUser, deleteUser, updateUser } from '../../lib/users/api';
	import type { User } from '../../lib/types';
	import Modal from '$lib/components/modals/Modal.svelte';

	let loading = false;
	let name = '';
	let users: User[] = [];
	let editUserId: number | null = null;

	onMount(async () => {
		users = await fetchUsers();
	});

	const handleSave = async () => {
		loading = true;
		if (editUserId === null) {
			const newUser = await createUser(name);
			if (newUser) {
				users = [...users, newUser];
			}
		} else {
			const updatedUser = await updateUser(editUserId, name);
			if (updatedUser) {
				users = users.map((user) => (user.id === editUserId ? updatedUser : user));
				editUserId = null;
			}
		}
		name = '';
		loading = false;
		toggleModal();
	};

	const enableEdit = (user: User) => {
		editUserId = user.id;
		name = user.name;
		toggleModal();
	};

	const handleDelete = async (id: number) => {
		const success = await deleteUser(id);
		if (success) {
			users = users.filter((user) => user.id !== id);
			if (editUserId === id) {
				editUserId = null;
				name = '';
			}
		}
	};
	let searchQuery = '';
	$: filteredUsers = users.filter(
		(user) =>
			user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
			user.id.toString().includes(searchQuery.toLowerCase())
	);

	let isModalOpen = false;

	function toggleModal() {
		isModalOpen = !isModalOpen;
		if (!isModalOpen) {
			name = '';
			editUserId = null;
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

		filteredUsers = [...filteredUsers].sort((a, b) => {
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
		<h1 class="text-3xl font-bold">List of Users</h1>
	</div>

	{#if isModalOpen}
		<Modal
			isOpen={isModalOpen}
			closeModal={toggleModal}
			title={editUserId ? 'Edit User' : 'Add User'}
		>
			<form
				on:submit|preventDefault={handleSave}
				class="mx-auto mb-5 flex max-w-lg flex-col space-y-4 rounded-lg p-6"
			>
				<input
					bind:value={name}
					placeholder="Enter Name"
					required
					class="rounded-md border bg-gray-50 px-4 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400"
				/>
				<button
					type="submit"
					class="rounded-md bg-blue-500 px-4 py-2 font-semibold text-white transition hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:cursor-not-allowed disabled:opacity-50"
				>
					{editUserId === null ? 'Create User' : 'Update User'}
				</button>
			</form>
		</Modal>
	{/if}

	<div class="my-4 flex justify-end">
		<button
			on:click={toggleModal}
			class="rounded-lg bg-green-500 px-5 py-3 text-sm font-semibold text-white"
		>
			Create New User
		</button>
	</div>
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
						ID {sortColumn === 'id' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
					</th>
					<th
						class="cursor-pointer text-nowrap px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-black dark:text-gray-300"
						on:click={() => sortData('name')}
					>
						Name {sortColumn === 'name' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
					</th>

					<th
						class="text-nowrap px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-black dark:text-gray-300"
					>
						Actions
					</th>
				</tr>
			</thead>
			<tbody>
				{#each filteredUsers as user (user.id)}
					<tr class="odd:bg-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700">
						<td class="w-1/4 whitespace-nowrap px-6 py-4 text-sm text-gray-800 dark:text-gray-200"
							>{user.id}</td
						>

						<td class="w-2/3 whitespace-nowrap px-6 py-4 text-sm text-gray-800 dark:text-gray-200"
							>{user.name}</td
						>

						<td class="w-1/4 whitespace-nowrap px-6 py-4 text-sm text-gray-800 dark:text-gray-200">
							<button
								on:click={() => enableEdit(user)}
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
								on:click={() => handleDelete(user.id)}
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
						<td colspan="8" class="px-6 py-4 text-center text-gray-500 dark:text-gray-300"
							>No Users found</td
						>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</div>
