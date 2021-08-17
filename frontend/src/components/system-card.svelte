<script>
</script>

<div class="system-card">
	<div class="name-bar">
		<img class="avatar" alt="system avatar" src="https://cdn.discordapp.com/attachments/481322557925228544/794013086956257280/ezgif-7-7cbf35f3b04d.gif" />
		<span class="name"><strong>Grey Skies</strong> (kndhm)</span>
		<button>edit</button>
	</div>
	<div class="info">
		<span class="info-1">
			<strong>Members:</strong> 113
			<br/>
			<strong>Tag:</strong> (GS)
		</span>
		<span class="info-2">
			<strong>Avatar:</strong> <a href="/test">link</a>
			<br/>
			<strong>Created:</strong> 03.21.2020
		</span>
		<span class="info-3"><strong>Fronters:</strong> Easy, Zinc, Mercury, Echo, Rust, ...</span>
	</div>
	<div class="description">
		<p><strong>Name:</strong> The Grey Skies<br><strong>System type:</strong> Traumagenic, polyfragmented<br><strong>Body age:</strong> 21<br><strong>Members:</strong> 100+<br><strong>List:</strong> <a href="https://greysdawn.com/system">https://greysdawn.com/system</a></p>
	</div>
</div>

<style>
	.system-card {
		height: auto;
		margin: 0 auto;
		color: #ddd;
		background: #333;
		text-align: left;

		display: grid; 
		grid-template-columns: 1fr 1fr 1fr; 
		grid-template-rows: .5fr .5fr 2fr;
		gap: 0px 0px; 
		grid-template-areas: 
			"top top top"
			"info info info" 
			"desc desc desc";
		/*align-items: center;*/
	}

	.avatar {
		grid-area: avatar;
		width: 48px;
		height: auto;
		border-radius: 50%;
		border: 2px solid #aaa;
	}

	.name-bar {
		grid-area: top;
		background: #202020;
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: flex-start;
		height: auto;
		padding: 2px 5px;
	}

	.name {
		margin-left: 10px;
	}

	.name-bar button {
		float: right;
		margin-left: auto;
		margin-right: 0;
	}

	.info {
		grid-area: info;
		height: 55px;
		max-height: 55px;
		overflow-y: auto;
		display: grid;
		grid-template-columns: 1fr 1fr 1fr;
		grid-template-rows: 1fr;
		grid-template-areas:
			"info-1 info-2 info-3";
	}

	.info-1 {
		grid-area: info-1;
		text-align: left;
		margin-left: 5px;
	}

	.info-2 {
		grid-area: info-2;
		text-align: left;
	}

	.info-3 {
		grid-area: info-3;
		text-align: left;
		margin-right: 5px;
	}

	.description {
		grid-area: desc;
		text-align: left;
		padding: 2px 5px;
		overflow-y: auto;
		overflow-x: hidden;
		word-break: break-all;
		word-wrap: break-word;
		height: 100%;
		box-sizing: border-box;
		border-top: 2px solid #111;
		/*background: rgba(20,20,20,.5);*/
	}

	.description p {
		margin: 0;
	}
</style>