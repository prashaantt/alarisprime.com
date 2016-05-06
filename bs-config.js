module.exports = {
	"rewriteRules": [
	{
		match: /<body/,
		fn: function (match) {
			return '<body data-no-turbolink="true" ';
		}
	}
	]
};
