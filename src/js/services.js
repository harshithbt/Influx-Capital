define(["jquery"],
	($) => {
		function getFirebaseICGET(url) {
			return $.ajax({
				url: url,
				type: "GET",
				contentType: "application/json",
			});
		}

		function addFirebaseICPOST(url,postData) {
			return $.ajax({
				url: url,
				type: "POST",
				contentType: "application/json",
				data: JSON.stringify(postData),
			});
		}

		function editFirebaseICPATCH(url,postData) {
			return $.ajax({
				url: url,
				type: "PATCH",
				contentType: "application/json",
				data: JSON.stringify(postData),
			});
		}

		return {
			getFirebaseICGET,
			addFirebaseICPOST,
			editFirebaseICPATCH,
		};
	},
);
