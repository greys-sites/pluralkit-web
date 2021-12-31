const de_regex = /\<(a?)\:(\w+)\:(\d+)\>/igm;
const de_url = 'https://cdn.discordapp.com/emojis/:id.:ext?v=1';
const img_markup = `<img class="emoji" src=":source" draggable="false" alt=":alt" />`;

module.exports = {
	pad(num) {
		return ('00' + num).slice(-2);
	},
	parseDiscordEmoji(str) {
		return str.replace(de_regex, (...args) => {
			var a = args[1];
			var alt = args[2];
			var id = args[3];

			var mk = img_markup
				.replace(
					":source",
					de_url.replace(':id', id)
						.replace(':ext', a ? 'gif' : 'png')
				)
				.replace(':alt', alt);
			return mk;
		})
	}
}