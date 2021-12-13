<script>
	// import UserStore from '../stores/user'
	let token;
	let err;
	
	async function login() {
		try {
			var req = await fetch('/api/login', {
				method: 'POST',
				body: JSON.stringify({token}),
				headers: {
					'content-type': 'application/json'
				}
			});

			if(req.status == 200) {
				window.location = '/';
			} else {
				err = await req.text();
			}
		} catch(e) {
			err = e.message;
		}
	}
</script>

<div>
	<p class={"error " + (err?.length ? "show" : "")}>
		{err}
	</p>
	<label>token:
	<input type=text bind:value={token} />
	</label>
	<button on:click={login}>Login</button>
</div>

<style>
	.error {
		color: red;
		display: none;
	}

	.error.show {
		display: block;
	}

	label {
		color: white;
		margin: 5px;
	}
</style>