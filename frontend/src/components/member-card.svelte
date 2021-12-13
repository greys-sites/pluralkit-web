<script>
	import showdown from 'showdown';
	import sanitize from 'sanitize-html';

	showdown.setOption('simplifiedAutoLink', true);
	showdown.setOption('simpleLineBreaks', true);
	showdown.setOption('openLinksInNewWindow', true);
	showdown.setOption('underline', true);
	showdown.setOption('strikethrough', true);

	var tags = [
		'em',
		'strong',
		'i',
		'b',
		'del',
		'u',
		'p',
		'a',
		'code',
		'pre',
		'br',
		'blockquote'
	];

	var conv = new showdown.Converter();

	export let m;

	let expanded = false;
	
	$: {
		let d = new Date(m.created)
		m.created = `${d.getMonth() + 1}.${d.getDate()}.${d.getFullYear()}`;

		if(m.birthday) {
			d = new Date(m.birthday);
			m.birthday = `${d.getMonth() + 1}.${d.getDate()}.${d.getFullYear()}`;
		}

		if(!m.description) m.description = "(no description)";
	else m.description = sanitize(conv.makeHtml(m.description), {allowedTags: tags})
	}
</script>

<div class="member-card{expanded ? ' expanded' : ''}">
	<div class="name-bar" on:click={() => expanded = !expanded}>
		<img class="avatar" alt="member avatar" src={m.avatar_url || "https://pk.greysdawn.com/default.png"}
		style="border: 3px solid #{m.color || "aaa"}"/>
		<span class="name"><strong>{m.name}</strong> ({m.id})</span>
		<button on:click={(e) => e.stopPropagation()}>edit</button>
	</div>
	<div class="info">
		<span class="info-1">
			<strong>Display Name:</strong> {m.display_name || "N/A"}
			<br/>
			<strong>Pronouns:</strong> {m.pronouns || "N/A"}
		</span>
		<span class="info-2">
			<strong>Birthday:</strong> {m.birthday || "N/A"}
			<br/>
			<strong>Created:</strong> {m.created}
		</span>
		<span class="info-3">
			<strong>Avatar:</strong> <a href={m.avatar_url}>link</a>
			<br/>
			<strong>Banner:</strong> <a href={m.banner_url}>link</a>
		</span>
	</div>
	<div class="description">
		{@html m.description}
	</div>
</div>

<style>
	a:visited {
		color: #5de;
	}

	.member-card {
		height: auto;
		max-height: 400px;
		margin: 0 0 20px 0;
		color: #ddd;
		background: #333;
		text-align: left;

		display: grid; 
		grid-template-columns: 1fr 1fr 1fr; 
		grid-template-rows: 55px 1fr 2fr;
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
		height: 48px;
		border-radius: 50%;
		object-fit: cover;
	}

	.name-bar {
		grid-area: top;
		background: #202020;
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: flex-start;
		height: 55px;
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
		max-height: 150px;
		grid-area: desc;
		text-align: left;
		padding: 2px 5px;
		overflow-y: auto;
		overflow-x: hidden;
		word-break: break-word;
		word-wrap: break-word;
		height: 100%;
		box-sizing: border-box;
		border-top: 2px solid #111;
		/*background: rgba(20,20,20,.5);*/
	}

	.description p {
		margin: 0;
	}

	.expand {
		display: none;
	}

	@media(max-width: 500px) {
		.expand {
			display: inline;
		}

		.member-card {
			max-height: 58px;
			display: block;
			/* flex-direction: column;
			align-items: space-between; */
			transition: .25s linear all;
			overflow-y: hidden;
		}

		.info {
			max-height: unset;
			max-width: 100%;
			height: 100%;
			display: flex;
			flex-direction: column;
			align-items: flex-start;
			justify-content: flex-start;
			overflow-x: auto;
			overflow-y: auto;
			transition: all .25s linear;
		}

		.info > * {
			margin-left: 5px;
			margin-top: 2px;
		}

		.member-card.expanded {
			max-height: 400px
		}

		.description {
			max-height: unset;
		}

		.description > p {
			margin: 2px;
		}
	}
</style>