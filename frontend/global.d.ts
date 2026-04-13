declare module '*.css' {
	const classes: { readonly [key: string]: string };
	export default classes;
}

declare module './src/app/globals.css';
