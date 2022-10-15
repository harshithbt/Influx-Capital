define(
	[],
	() => {
		function generateRandomString() {
			let text = "";
			const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

			for (let i = 0; i < 35; i += 1) {
				text += possible.charAt(Math.floor(Math.random() * possible.length));
			}

			return text;
		}

		return {
			generateRandomString,
		};
	},
);
