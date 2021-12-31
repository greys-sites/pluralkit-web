<script>
	import showdown from 'showdown';
	import sanitize from 'sanitize-html';
	import twemoji from 'twemoji';
	import { pad, parseDiscordEmoji } from '../utils.js';

	showdown.setOption('simplifiedAutoLink', true);
	showdown.setOption('simpleLineBreaks', true);
	showdown.setOption('openLinksInNewWindow', true);
	showdown.setOption('underline', true);
	showdown.setOption('strikethrough', true);

	var allowedTags = [
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
		'blockquote',
		'img'
	];

	const allowedAttributes = {
		img: [
			'src',
			'class',
			'alt',
			'draggable'
		]
	}

	var conv = new showdown.Converter();

	export let sys;
	export let fr;

	let expanded = false;
	let front = "(none)";
	
	$: {
		let d = new Date(sys.created)
		sys.created = `${pad(d.getMonth() + 1)}` +
			`.${pad(d.getDate())}` +
			`.${d.getFullYear()}`;

		if(!sys.description) sys.description = "(no description)";
		else {
			sys.description = conv.makeHtml(sys.description);
			sys.description = twemoji.parse(sys.description);
			sys.description = parseDiscordEmoji(sys.description);
			sys.description = sanitize(sys.description, {allowedTags, allowedAttributes});
		}

		if(fr && fr.members && fr.members.length) {
			front = fr.members.map(m => m.name).join(', ');
		}
	}
</script>

<div class="system-card">
	<div class="name-bar">
		<img class="avatar" alt="system avatar" src={sys.avatar_url || "https://pk.greysdawn.com/default.png"} />
		<span class="name"><strong>{sys.name || "(unnamed)"}</strong> ({sys.id})</span>
		<button>edit</button>
	</div>
	<div class="info">
		<span class="info-1">
			<strong>Members:</strong> {sys.count}
			<br/>
			<strong>Tag:</strong> {sys.tag}
		</span>
		<span class="info-2">
			<strong>Fronters:</strong> {front}
			<br/>
			<strong>Created:</strong> {sys.created}
		</span>
		<span class="info-3">
		<strong>Avatar:</strong> <a href={sys.avatar_url}>link</a>
			<br/>
			<strong>Banner:</strong> <a href={sys.banner_url}>link</a>
		</span>
	</div>
	<div class="description">
		{@html sys.description}
	</div>
</div>

<style>
	.system-card {
		height: auto;
		max-height: 400px;
		margin: 0 0 20px 0;
		color: #ddd;
		background: #333;
		text-align: left;
		overflow-y: hidden;
		display: flex;
		flex-direction: column;
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
		height: 100%;
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		justify-content: flex-start;
	}

	.info > * {
		margin-left: 5px;
		margin-top: 2px;
	}

	.description {
		/* max-height: 150px; */
		grid-area: desc;
		text-align: left;
		padding: 2px 5px;
		margin: 0;
		overflow-y: auto;
		overflow-x: hidden;
		word-break: break-word;
		word-wrap: break-word;
		box-sizing: border-box;
		border-top: 2px solid #111;
		background: rgba(20,20,20,.5);
	}

	.description > :global(p) {
		margin: 0 0 5px 0;
		padding: 0;
	}	
</style>