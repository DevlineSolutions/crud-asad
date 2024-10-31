
<script>
    export let isOpen = false;
    export let closeModal;
    export let title;
  
    function handleOverlayClick(event) {
      if (event.target === event.currentTarget) {
        closeModal();
      }
    }
  </script>
  
  {#if isOpen}
    <div
      class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center"
      on:click={handleOverlayClick}
    >
      <div
        class="bg-white dark:bg-gray-800 rounded-lg shadow-xl transform transition-all duration-300 ease-in-out max-w-lg w-full"
        style="max-height: 95vh; overflow-y: auto;"
      >
        <header class="flex sticky top-0 bg-white justify-between items-center p-2 border-b border-gray-200 dark:border-gray-700">
          <h2 class="text-xl font-semibold ms-4 text-gray-800 dark:text-gray-200 ">{title}</h2>
          <button
            class="text-gray-400 text-3xl me-4 hover:text-gray-600 dark:hover:text-gray-300"
            on:click={closeModal}
          >
            &times;
          </button>
        </header>
  
        <main class="pt-4 text-gray-700 dark:text-gray-300">
          <!-- Modal content goes here -->
          <slot></slot>
        </main>
  
      </div>
    </div>
  {/if}
  
  <style>
    /* Add a subtle fade-in effect for the modal */
    div[open] {
      opacity: 0;
      animation: fadeIn 0.3s forwards;
    }
  
    @keyframes fadeIn {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }
  </style>
  