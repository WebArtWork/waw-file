const path = require("path");
const fs = require("fs");
/* To Do
1) Delete temp files periodically
2) Add support for aws and google files
3) Add support for files directly
*/

// Function to fetch the image and convert it to Data URL
async function urlToDataUrl(imageUrl) {
	try {
		// Fetch the image from the URL
		const response = await fetch(imageUrl);

		if (!response.ok) {
			throw new Error("Image not found or unable to fetch");
		}

		// Get the image as a binary array buffer
		const arrayBuffer = await response.arrayBuffer();

		// Convert array buffer to a Buffer
		const imageBuffer = Buffer.from(arrayBuffer);

		// Convert image buffer to Base64 string
		const base64Image = imageBuffer.toString("base64");

		// Return the Data URL with the MIME type
		return `data:image/png;base64,${base64Image}`;
	} catch (error) {
		console.error("Error fetching or processing the image:", error);
		throw error;
	}
}

module.exports = async (waw) => {
	waw.crud("file", {
		create: {
			ensure: (req, res, next) => {
				if (req.user) {
					req.body.url =
						(waw.config.url || "https://webart.work") +
						req.body.path;

					next();
				} else {
					res.send(false);
				}
			},
		},
	});

	const router = waw.router("/api/file");

	waw.save_file = (url) => {
		if (url.split("/").length !== 4) {
			return;
		}
		const container = url.split("/")[2];
		const file = url.split("/")[5].split("?")[0];
		const tempFilePath = path.join(__dirname, "temp", container, file);

		if (fs.existsSync(tempFilePath)) {
			const filePath = path.join(__dirname, "files", container, file);

			fs.renameSync(tempFilePath, filePath);
		}
	};

	waw.delete_file = (url) => {
		if (url.split("/").length !== 4) {
			return;
		}
		const container = url.split("/")[2];
		const file = url.split("/")[5].split("?")[0];
		const tempFilePath = path.join(__dirname, "temp", container, file);

		if (fs.existsSync(tempFilePath)) {
			fs.rmSync(tempFilePath);
		}

		const filePath = path.join(__dirname, "files", container, file);

		if (fs.existsSync(filePath)) {
			fs.rmSync(tempFilePath);
		}
	};

	router.get("/get/:container/:file", (req, res) => {
		const tempFilePath = path.join(
			__dirname,
			"temp",
			req.params.container,
			req.params.file
		);

		const filePath = path.join(
			__dirname,
			"files",
			req.params.container,
			req.params.file
		);

		if (fs.existsSync(tempFilePath)) {
			res.sendFile(tempFilePath);
		} else if (fs.existsSync(filePath)) {
			res.sendFile(filePath);
		} else {
			res.sendFile(__dirname + "/default.jpg");
		}
	});

	router.post("/photo", async (req, res) => {
		const name = req.body.name || Date.now() + ".png";
		const container = req.body.container || "general";
		const filePath = path.join(__dirname, "files", container);
		waw.dataUrlToLocation(req.body.dataUrl, filePath, name, () => {
			res.json(`/api/file/get/${container}/${name}?${Date.now()}`);
		});
	});

	router.post("/photocrawl", async (req, res) => {
		const name = req.body.name || Date.now() + ".png";
		const container = req.body.container || "general";
		const filePath = path.join(__dirname, "files", container);

		urlToDataUrl(req.body.url)
			.then((dataUrl) => {
				waw.dataUrlToLocation(dataUrl, filePath, name, () => {
					res.json(
						`/api/file/get/${container}/${name}?${Date.now()}`
					);
				});
			})
			.catch((error) => {
				console.error("Error:", error);
			});
	});

	router.post("/file", async (req, res) => {
		const name = req.body.name || Date.now() + ".png";
		const container = req.body.container || "general";
		const filePath = path.join(__dirname, "files", container);
		waw.dataUrlToLocation(req.body.dataUrl, filePath, name, () => {
			res.json(`/api/file/get/${container}/${name}?${Date.now()}`);
		});
	});
};
