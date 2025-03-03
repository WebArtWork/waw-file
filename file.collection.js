module.exports = async function (waw) {
	const Schema = waw.mongoose.Schema({
		path: String,
		url: String,
		author: {
			type: waw.mongoose.Schema.Types.ObjectId,
			ref: "User",
		},
		moderators: [
			{
				type: waw.mongoose.Schema.Types.ObjectId,
				sparse: true,
				ref: "User",
			},
		],
	});

	Schema.methods.create = function (obj, user, waw) {
		this.author = user._id;

		this.moderators = [user._id];

		this.url = obj.url;

		this.path = obj.path;
	};
	return (waw.File = waw.mongoose.model("File", Schema));
};
