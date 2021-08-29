<script>
	import MemberCard from './member-card.svelte';
	import { writable } from 'svelte/store';

	let pstore = writable(1);
	let page = 1;
	let count = 10;
	let offset = 0;
	let l;

	pstore.subscribe(val => {
		page = val;
		offset = (page - 1) * count;
	})

	let members;
	fetch(`https://api.pluralkit.me/v1/s/kezkv/members`, {
		headers: {'authorization': 'i8rJ1ZgmDHtASYZNeZGMLP9DMhlG9vvfmtdMHzdeRL91IiE4cTaIUsKQPRUATY1m'}
	})
		.then(r => r.json())
		.then(data => {
			members = data.sort((a, b) => {
				a = a.name.toLowerCase();
				b = b.name.toLowerCase();
				return a > b ? 1 : a < b ? -1 : 0
			});
		})
	$: l = members && members.slice(offset, offset + count);
	$: max = members && Math.ceil(members.length / count);
</script>

<div class="member-list">
	{#if members && members.length > count}
	<div class="buttons">
	<button class={page == 1 ? "disabled" : ""} on:click={() => page - 1 > 0 ? $pstore -= 1 : 1}>page {page - 1 > 0 ? page - 1 : 1}</button>

	<label>Page size: <input type=number bind:value={count}/></label>

	<button class={page == max ? "disabled" : ""} on:click={() => page + 1 <= max ? $pstore += 1 : max}>page {page + 1 <= max ? page + 1 : max}</button>
	</div>
	{/if}
	{#if l}
		{#each l as m}
			<MemberCard {m}/>
		{/each}
	{/if}
</div>

<style>
	.member-list {
		display: flex;
		flex-direction: column;
		width: 100%;
		margin: 0 auto;
	}

	.buttons {
		width:  100%;
		display:  flex;
		flex-direction: row;
		justify-content: space-between;
		align-items: center;
		user-select: none;
		-webkit-user-select: none;
		-webkit-touch-callout: none;
	}

	button.disabled {
		opacity: .5;
		cursor: not-allowed;
	}

	input {
		background: #555;
		border: none;
		color: white;
		width: 50px;
	}

	label {
		color: white;
	}
</style>