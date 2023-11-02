<script>
	import P5 from 'p5-svelte';
	import Range from "./Range.svelte";

	let wWidth = window.innerWidth;
	let wHeight = window.innerHeight;
	let bgcolor = "black";	

	let c;
	let X = 10;
	let Y = 10;

	let flowLabel = "flow";

	const sketch = (p5) => {
		p5.setup = () => {
			c = p5.createCanvas(wWidth, wHeight);
			p5.colorMode(p5.HSB, 255);
			p5.smooth();		
			
			p5.background(bgcolor);

		p5.draw = () => {
		}
	}
}
</script>
<div class="controls">
	<div class="row">
		<!-- <Range bind:value={quantity} label="quantity" min={1} max={30} /> -->
		<Range bind:value={X} label="quantity" min={1} max={100} />
		<Range bind:value={Y} label="dencity" min={1} max={100} />
	</div>
	<div class="butts">
		<p>{X}</p>
		<p>{Y}</p>
		<button class="butt">{flowLabel}</button>
		<!-- <button class="butt" on:click={toggleFullscreen}>
			{isFullscreen ? 'exit' : 'fullscreen'}
		  </button> -->
		  <!-- <button class="butt" on:click={randomize}>random</button> -->
		<!-- <button class="butt" on:click={saveImage}>save</button> -->
		
	</div>
</div>

<div class="container">
	<P5 {sketch} />
</div>


<style>
	:global(html, body) {
		margin: 0;
		padding: 0;
		width: 100%;
		height: 100%;
		background-color: black;
		-webkit-font-smoothing: antialiased;
	}
	.controls {
		display: flex;
		position: fixed;
		flex-direction: column;
		justify-content: stretch;
		top: 0;
		bottom: 0;
		left: 0;
		right: 0;
		z-index: 99;
	}
	
	.row {
		display: flex;
		flex-direction: row;
		height: 100%;
	}
	
	.container {
		position: absolute;
		top: 0;
		bottom: 0;
		left: 0;
		right: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 0;
	}

	.butts {
		padding-left: 24px;
		padding-bottom: 24px;
	}

	.butt {
		font-size: 12px;
		line-height: 20px;
		background:transparent;
		color: white;
		border: 0;
	  }
</style>