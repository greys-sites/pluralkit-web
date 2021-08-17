<script>
	import SystemCard from './components/system-card.svelte';
	import MemberList from './components/member-list.svelte';
</script>

<header>
	<h3>Pluralkit Web</h3>
	<button>login</button>
</header>

<main>
	<h1>System</h1>
	<SystemCard />
	<h1>Members</h1>
	<MemberList />
</main>

<style>
	header {
		width: 100%;
		background: #333;
		padding: 2px 8px;
		height: 3em;
		display: flex;
		align-items: center;
		justify-content: space-between;
		box-sizing: border-box;
	}
	header h3 {
		color: white;
		opacity: .75;
		float: left;
		margin:  0;
	}

	main {
		text-align: left;
		margin: 0 auto;
		width: 80%;
	}

	h1 {
		color: #ddd;
		text-transform: uppercase;
		font-size: 1.5em;
		font-weight: bold;
	}

	@media (min-width: 640px) {
		main {
			max-width: none;
		}
	}
</style>