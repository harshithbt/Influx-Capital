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

		function downloadBlob(content, fileName) {
			const items = content;
			const replacer = (key, value) => (value === null ? "" : typeof value === 'string' ? value.replace(/\n/g, " ") : value);
			const header = Object.keys(items[0]);
			let csv = items.map((row) => header.map((fieldName) => JSON.stringify(row[fieldName], replacer)).join(","));
			csv.unshift(header.join(","));
			csv = csv.join("\r\n");
			const downloadLink = document.createElement("a");
			const blob = new Blob(["\ufeff", csv], { type: "text/csv;charset=utf-8;" });
			const url = URL.createObjectURL(blob);
			downloadLink.href = url;
			downloadLink.download = fileName;
			document.body.appendChild(downloadLink);
			downloadLink.click();
			document.body.removeChild(downloadLink);
		}

		return {
			generateRandomString,
			downloadBlob,
		};
	},
);
