define(
	[],
	() => {
		const userCookieName = "IC_UCM_INFO";

		function createUserCookie(email, displayName, sessionId, initial, uid) {
			document.cookie = `${userCookieName}=3~${sessionId}~${displayName}~${email}~${initial}~${uid}`;
		}

		function deleteUserCookie() {
			document.cookie = `${userCookieName} =; expires=Thu, 01 Jan 1970 00:00:01 GMT;`;
		}

		function getUserCookieArray() {
			const name = `${userCookieName}=`;
			const decodedCookie = decodeURIComponent(document.cookie);
			const ca = decodedCookie.split(";");
			for (let i = 0; i < ca.length; i += 1) {
				let c = ca[i];
				while (c.charAt(0) === " ") {
					c = c.substring(1);
				}
				if (c.indexOf(name) === 0) {
					return c.substring(name.length, c.length).split("~");
				}
			}
			return [];
		}

		return {
			createUserCookie,
			deleteUserCookie,
			getUserCookieArray,
		};
	},
);
