<script>
	export default {
		onLaunch: function() {
			console.log('App Launch')
		},
		onShow: function() {
			console.log('App Show')
		},
		onHide: function() {
			console.log('App Hide')
		}
	}
</script>

<style>
@font-face {
	font-family: 'Long Cang';
	src: url('/static/fonts/LongCang-Regular.ttf') format('truetype');
}

page {
	font-family: 'Long Cang', 'PingFang SC', sans-serif;
}

view, text, button, input, textarea {
	font-family: 'Long Cang', 'PingFang SC', sans-serif;
}
</style>
