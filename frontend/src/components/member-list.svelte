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
	$: fetch(`https://api.pluralkit.me/v1/s/kezkv/members`, {
		headers: {'authorization': 'i8rJ1ZgmDHtASYZNeZGMLP9DMhlG9vvfmtdMHzdeRL91IiE4cTaIUsKQPRUATY1m'}
	})
		.then(r => r.json())
		.then(data => {
			members = data.sort((a, b) => {
				a = a.name.toLowerCase();
				b = b.name.toLowerCase();
				return a > b ? 1 : a < b ? -1 : 0
			});

			l = members.slice(offset, offset + count)
		})
</script>

<div class="member-list">
	<button on:click={() => $pstore -= 1}>page {page - 1}</button>
	<button on:click={() => $pstore += 1}>page {page + 1}</button>
	<br/>
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
</style>