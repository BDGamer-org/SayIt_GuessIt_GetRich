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
	font-family: 'ZhiMangXing';
	src: url('/static/fonts/ZhiMangXing-Regular.ttf') format('truetype');
}

@font-face {
	font-family: 'ZhengQingKe';
	src: url('/static/fonts/ZhengQingKeNanBei.ttf') format('truetype');
}

page {
	font-family: 'ZhengQingKe', 'PingFang SC', sans-serif;
}

view, text, button, input, textarea {
	font-family: 'ZhengQingKe', 'PingFang SC', sans-serif;
}
</style>
