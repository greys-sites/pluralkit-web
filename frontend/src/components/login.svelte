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
	<form on:submit|preventDefault={login}>
		<label>Enter your token below. You can obtain this with "pk;token"
		<br/>
		<br/>
		<input type=text bind:value={token} placeholder="token"/>
		</label>
		<button type="submit">Login</button>
	</form>
	<p class={"error " + (err?.length ? "show" : "")}>
		{err}
	</p>
</div>

<style>
	div {
		text-align: center;
		/*padding: 20px 0;*/
	}

	p {
		margin: 10px;
	}

	input {
		width: 50%;
	    background-color: #333;
	    border: 2px solid #000;
	    border-radius: 5px;
	    padding: 10px;
	    color: #ccc;
	    font-weight: bold;
	}

	.error {
		color: #6aecf9;
		font-weight: bold;
		display: none;
	}

	.error.show {
		display: block;
	}

	label {
		color: white;
	}
</style>