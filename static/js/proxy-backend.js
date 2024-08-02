"use strict";
/**
 * @type {HTMLFormElement}
 */
const form = document.getElementById("uv-form");
/**
 * @type {HTMLInputElement}
 */
const input = document.getElementById("uv-form-input");
/**
 * @type {HTMLInputElement}
 */
const searchEngine = localStorage.getItem("searchEngine");
if (!searchEngine) localStorage.setItem("searchEngine", "https://www.google.com/search?q=%s")
/**
 * @type {HTMLParagraphElement}
 */
const error = document.getElementById("uv-error");
/**
 * @type {HTMLPreElement}
 */
const errorCode = document.getElementById("uv-error-code");
const connection = new BareMux.BareMuxConnection("/baremux/worker.js");

form.addEventListener("submit", async (e) => {
	e.preventDefault();
	try {
		await registerSW();
	} catch (err) {
		alert("There has been an error while registering the ServiceWorker. (Check console for more information.)")
		console.error(err)
	}

	const url = search(input.value, searchEngine);

	let wisp = (location.protocol === "https:" ? "wss" : "ws") + "://" + location.host + "/wisp/";
	if (await connection.getTransport() !== "/epoxy/index.mjs") {
		await connection.setTransport("/epoxy/index.mjs", [{ wisp: wisp }]);
	}
	window.location.href = __uv$config.prefix + __uv$config.encodeUrl(url);
});
