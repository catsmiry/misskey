<!--
SPDX-FileCopyrightText: syuilo and misskey-project
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<svg
	version="1.1"
	viewBox="0 0 203.2 152.4"
	xmlns="http://www.w3.org/2000/svg"
	xmlns:xlink="http://www.w3.org/1999/xlink"
>
	<g fill-rule="evenodd">
		<rect width="203.2" height="152.4" :fill="themeVariables.bg" stroke-width=".26458"/>
		<rect width="65.498" height="152.4" :fill="themeVariables.panel" stroke-width=".26458"/>
		<rect x="65.498" width="137.7" height="40.892" :fill="themeVariables.acrylicBg" stroke-width=".265"/>
		<path transform="scale(.26458)" d="m439.77 247.19c-43.673 0-78.832 35.157-78.832 78.83v249.98h407.06v-328.81z" :fill="themeVariables.panel"/>
	</g>
	<g>
		<rect x="12.817" y="63.222" width="39.464" height="39.464" rx="15" ry="15" :fill="themeVariables.accentedBg"/>
		<circle cx="32.749" cy="83.054" r="18" fill="transparent" stroke-dasharray="0.319256, 0.319256" stroke-width=".15963" style="paint-order:stroke fill markers"/>
	</g>
	<g>
		<rect x="112.794" y="82.884" width="47.752" height="47.752" rx="10" ry="10" :fill="themeVariables.fg" fill-opacity="0.5"/>
		<circle cx="136.67" cy="106.76" r="23.876" fill="transparent" fill-opacity="0.5" stroke-dasharray="0.352425, 0.352425" stroke-width=".17621" style="paint-order:stroke fill markers"/>
	</g>
	<g :fill="themeVariables.fg" fill-rule="evenodd" stroke-width=".26458">
		<rect x="171.27" y="87.815" width="48.576" height="6.8747" ry="3.4373"/>
		<rect x="171.27" y="105.09" width="48.576" height="6.875" ry="3.4375"/>
		<rect x="171.27" y="121.28" width="48.576" height="6.875" ry="3.4375"/>
		<rect x="171.27" y="137.47" width="48.576" height="6.875" ry="3.4375"/>
	</g>
	<path d="m65.498 40.892h137.7" :stroke="themeVariables.divider" stroke-width="0.75"/>
	<g transform="matrix(.60823 0 0 .60823 25.45 75.755)" fill="none" :stroke="themeVariables.accent" stroke-linecap="round" stroke-linejoin="round" stroke-width="2">
		<path d="m0 0h24v24h-24z" fill="none" stroke="none"/>
		<path d="m5 12h-2l9-9 9 9h-2"/>
		<path d="m5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7"/>
		<path d="m9 21v-6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v6"/>
	</g>
	<g transform="matrix(.61621 0 0 .61621 25.354 117.92)" fill="none" :stroke="themeVariables.fg" stroke-linecap="round" stroke-linejoin="round" stroke-width="2">
		<path d="m0 0h24v24h-24z" fill="none" stroke="none"/>
		<path d="m10 5a2 2 0 1 1 4 0 7 7 0 0 1 4 6v3a4 4 0 0 0 2 3h-16a4 4 0 0 0 2-3v-3a7 7 0 0 1 4-6"/>
		<path d="m9 17v1a3 3 0 0 0 6 0v-1"/>
	</g>
	<image x="16.948" y="18.388" width="31.602" height="31.602" image-rendering="optimizeSpeed" preserveAspectRatio="xMidYMid meet" v-bind="{ 'xlink:href': instance.iconUrl || '/favicon.ico' }" clip-path="url(#instance-icon)"/>
	<defs>
		<clipPath id="instance-icon"><rect x="16.948" y="18.388" width="31.602" height="31.602" rx="11" ry="11"/></clipPath>
	</defs>
</svg>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import lightTheme from '@@/themes/_light.json5';
import darkTheme from '@@/themes/_dark.json5';
import type { Theme } from '@/theme.js';
import { instance } from '@/instance.js';
import { compile } from '@/theme.js';
import { deepClone } from '@/utility/clone.js';

const props = defineProps<{
	theme: Theme;
}>();

const themeVariables = ref<{
	bg: string;
	acrylicBg: string;
	panel: string;
	fg: string;
	divider: string;
	accent: string;
	accentedBg: string;
}>({
	bg: 'var(--MI_THEME-bg)',
	acrylicBg: 'var(--MI_THEME-acrylicBg)',
	panel: 'var(--MI_THEME-panel)',
	fg: 'var(--MI_THEME-fg)',
	divider: 'var(--MI_THEME-divider)',
	accent: 'var(--MI_THEME-accent)',
	accentedBg: 'var(--MI_THEME-accentedBg)',
});

watch(() => props.theme, (theme) => {
	if (theme == null) return;

	const _theme = deepClone(theme);

	if (_theme.base != null) {
		const base = [lightTheme, darkTheme].find(x => x.id === _theme.base);
		if (base) _theme.props = Object.assign({}, base.props, _theme.props);
	}

	const compiled = compile(_theme);

	themeVariables.value = {
		bg: compiled.bg ?? 'var(--MI_THEME-bg)',
		acrylicBg: compiled.acrylicBg ?? 'var(--MI_THEME-acrylicBg)',
		panel: compiled.panel ?? 'var(--MI_THEME-panel)',
		fg: compiled.fg ?? 'var(--MI_THEME-fg)',
		divider: compiled.divider ?? 'var(--MI_THEME-divider)',
		accent: compiled.accent ?? 'var(--MI_THEME-accent)',
		accentedBg: compiled.accentedBg ?? 'var(--MI_THEME-accentedBg)',
	};
}, { immediate: true });
</script>
