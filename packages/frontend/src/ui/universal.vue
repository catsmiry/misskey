<!--
SPDX-FileCopyrightText: syuilo and misskey-project
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<div :class="$style.root">
	<XSidebar v-if="!isMobile" :class="$style.sidebar" :showWidgetButton="!isDesktop" @widgetButtonClick="widgetsShowing = true"/>

	<div :class="$style.contents" @contextmenu.stop="onContextmenu">
		<div v-if="!showEl2">
			<XPreferenceRestore v-if="shouldSuggestRestoreBackup"/>
			<XAnnouncements v-if="$i"/>
			<XStatusBars :class="$style.statusbars"/>
		</div>
		<StackingRouterView v-if="prefer.s['experimental.stackingRouterView']" :class="$style.content"/>
		<RouterView v-else :class="$style.content"/>
		<div v-if="isMobile" ref="navFooter" :class="[$style.nav, { [$style.reduceAnimation]: !prefer.s.animation, [$style.showEl]: (showEl && ['hideFloatBtnNavBar', 'hide'].includes(<string>prefer.s.displayHeaderNavBarWhenScroll)) }]">
			<button v-if="store.s.showMenuButtonInNavbar" v-vibrate="prefer.s['vibrate.on.system'] ? 5 : []" :class="$style.navButton" class="_button" @click="drawerMenuShowing = true"><i :class="$style.navButtonIcon" class="ti ti-menu-2"></i><span v-if="menuIndicated" :class="$style.navButtonIndicator" class="_blink"><i class="_indicatorCircle"></i></span></button>
			<button v-if="store.s.showHomeButtonInNavbar" v-vibrate="prefer.s['vibrate.on.system'] ? 5 : []" :class="$style.navButton" class="_button" @click="mainRouter.push('/')"><i :class="$style.navButtonIcon" class="ti ti-home"></i></button>
			<button v-if="store.s.showExploreButtonInNavbar" v-vibrate="prefer.s['vibrate.on.system'] ? 5 : []" :class="$style.navButton" class="_button" @click="mainRouter.push('/explore')"><i :class="$style.navButtonIcon" class="ti ti-hash"></i></button>
			<button v-if="store.s.showSearchButtonInNavbar" v-vibrate="prefer.s['vibrate.on.system'] ? 5 : []" :class="$style.navButton" class="_button" @click="mainRouter.push('/search')"><i :class="$style.navButtonIcon" class="ti ti-search"></i></button>
			<button v-if="store.s.showNotificationButtonInNavbar" v-vibrate="prefer.s['vibrate.on.system'] ? 5 : []" :class="$style.navButton" class="_button" @click="mainRouter.push('/my/notifications')">
				<i :class="$style.navButtonIcon" class="ti ti-bell"></i>
				<span v-if="$i?.hasUnreadNotification" :class="$style.navButtonIndicator" class="_blink">
					<span v-if="prefer.s.showUnreadNotificationsCount" class="_indicateCounter" :class="$style.itemIndicateValueIcon">{{ $i.unreadNotificationsCount > 99 ? '99+' : $i.unreadNotificationsCount }}</span>
					<i v-else class="_indicatorCircle"></i>
				</span>
			</button>
			<button v-if="store.s.showChatButtonInNavbar" v-vibrate="prefer.s['vibrate.on.system'] ? 5 : []" :class="$style.navButton" class="_button" @click="mainRouter.push('/chat')">
				<i :class="$style.navButtonIcon" class="ti ti-messages"></i>
				<span v-if="$i != null && $i.hasUnreadChatMessages" :class="$style.navButtonIndicator" class="_blink">
					<i class="_indicatorCircle"></i>
				</span>
			</button>
			<button v-if="store.s.showWidgetButtonInNavbar" v-vibrate="prefer.s['vibrate.on.system'] ? 5 : []" :class="$style.navButton" class="_button" @click="widgetsShowing = true"><i :class="$style.navButtonIcon" class="ti ti-apps"></i></button>
			<button v-if="store.s.showPostButtonInNavbar" v-vibrate="prefer.s['vibrate.on.system'] ? 5 : []" :class="$style.postButton" class="_button" @click="os.post()"><i :class="$style.navButtonIcon" class="ti ti-pencil"></i></button>
		</div>
	</div>

	<div v-if="isDesktop && !pageMetadata?.needWideArea && prefer.s.enableWidgetsArea" :class="$style.widgets">
		<XWidgets/>
	</div>

	<Transition
		:enterActiveClass="prefer.s.animation ? $style.transition_menuDrawerBg_enterActive : ''"
		:leaveActiveClass="prefer.s.animation ? $style.transition_menuDrawerBg_leaveActive : ''"
		:enterFromClass="prefer.s.animation ? $style.transition_menuDrawerBg_enterFrom : ''"
		:leaveToClass="prefer.s.animation ? $style.transition_menuDrawerBg_leaveTo : ''"
	>
		<div
			v-if="drawerMenuShowing"
			:class="$style.menuDrawerBg"
			class="_modalBg"
			@click="drawerMenuShowing = false"
			@touchstart.passive="drawerMenuShowing = false"
		></div>
	</Transition>

	<Transition
		:enterActiveClass="prefer.s.animation ? $style.transition_menuDrawer_enterActive : ''"
		:leaveActiveClass="prefer.s.animation ? $style.transition_menuDrawer_leaveActive : ''"
		:enterFromClass="prefer.s.animation ? $style.transition_menuDrawer_enterFrom : ''"
		:leaveToClass="prefer.s.animation ? $style.transition_menuDrawer_leaveTo : ''"
	>
		<div v-if="drawerMenuShowing" :class="$style.menuDrawer">
			<XDrawerMenu/>
		</div>
	</Transition>

	<Transition
		:enterActiveClass="prefer.s.animation ? $style.transition_widgetsDrawerBg_enterActive : ''"
		:leaveActiveClass="prefer.s.animation ? $style.transition_widgetsDrawerBg_leaveActive : ''"
		:enterFromClass="prefer.s.animation ? $style.transition_widgetsDrawerBg_enterFrom : ''"
		:leaveToClass="prefer.s.animation ? $style.transition_widgetsDrawerBg_leaveTo : ''"
	>
		<div
			v-if="widgetsShowing"
			:class="$style.widgetsDrawerBg"
			class="_modalBg"
			@click="widgetsShowing = false"
			@touchstart.passive="widgetsShowing = false"
		></div>
	</Transition>

	<Transition
		:enterActiveClass="prefer.s.animation ? (prefer.s.widgetsPosition === 'right' ? $style.transition_widgetsDrawer_right_enterActive : $style.transition_widgetsDrawer_enterActive) : ''"
		:leaveActiveClass="prefer.s.animation ? (prefer.s.widgetsPosition === 'right' ? $style.transition_widgetsDrawer_right_leaveActive : $style.transition_widgetsDrawer_leaveActive) : ''"
		:enterFromClass="prefer.s.animation ? (prefer.s.widgetsPosition === 'right' ? $style.transition_widgetsDrawer_right_enterFrom : $style.transition_widgetsDrawer_enterFrom) : ''"
		:leaveToClass="prefer.s.animation ? (prefer.s.widgetsPosition === 'right' ? $style.transition_widgetsDrawer_right_leaveTo : $style.transition_widgetsDrawer_leaveTo) : ''"
	>
		<div v-if="widgetsShowing" :class="[$style.widgetsDrawer, { [$style.widgetsDrawerRight]: prefer.s.widgetsPosition === 'right' }]">
			<button class="_button" :class="$style.widgetsCloseButton" @click="widgetsShowing = false"><i class="ti ti-x"></i></button>
			<XWidgets/>
		</div>
	</Transition>

	<XCommon/>
</div>
</template>

<script lang="ts" setup>
import { defineAsyncComponent, provide, onMounted, computed, ref, watch, useTemplateRef, onBeforeUnmount } from 'vue';
import { instanceName } from '@@/js/config.js';
import { isLink } from '@@/js/is-link.js';
import XCommon from './_common_/common.vue';
import type { PageMetadata } from '@/page.js';
import XDrawerMenu from '@/ui/_common_/navbar-for-mobile.vue';
import * as os from '@/os.js';
import { navbarItemDef } from '@/navbar.js';
import { i18n } from '@/i18n.js';
import { $i } from '@/i.js';
import { provideMetadataReceiver, provideReactiveMetadata } from '@/page.js';
import { deviceKind } from '@/utility/device-kind.js';
import { miLocalStorage } from '@/local-storage.js';
import { mainRouter } from '@/router.js';
import { prefer } from '@/preferences.js';
import { shouldSuggestRestoreBackup } from '@/preferences/utility.js';
import { DI } from '@/di.js';
import { globalEvents } from '@/events.js';
import { store } from '@/store.js';

const XWidgets = defineAsyncComponent(() => import('./universal.widgets.vue'));
const XSidebar = defineAsyncComponent(() => import('@/ui/_common_/navbar.vue'));
const XStatusBars = defineAsyncComponent(() => import('@/ui/_common_/statusbars.vue'));
const XAnnouncements = defineAsyncComponent(() => import('@/ui/_common_/announcements.vue'));
const XPreferenceRestore = defineAsyncComponent(() => import('@/ui/_common_/PreferenceRestore.vue'));

const isRoot = computed(() => mainRouter.currentRoute.value.name === 'index');

const DESKTOP_THRESHOLD = 1100;
const MOBILE_THRESHOLD = 500;

// デスクトップでウィンドウを狭くしたときモバイルUIが表示されて欲しいことはあるので deviceKind === 'desktop' の判定は行わない
const isDesktop = ref(window.innerWidth >= DESKTOP_THRESHOLD);
const isMobile = ref(deviceKind === 'smartphone' || window.innerWidth <= MOBILE_THRESHOLD);
window.addEventListener('resize', () => {
	isMobile.value = deviceKind === 'smartphone' || window.innerWidth <= MOBILE_THRESHOLD;
});

const showEl = ref(false);
const showEl2 = ref(false);

const pageMetadata = ref<null | PageMetadata>(null);
const widgetsShowing = ref(false);
const navFooter = useTemplateRef('navFooter');

provide(DI.router, mainRouter);
provideMetadataReceiver((metadataGetter) => {
	const info = metadataGetter();
	pageMetadata.value = info;
	if (pageMetadata.value) {
		if (isRoot.value && pageMetadata.value.title === instanceName) {
			window.document.title = pageMetadata.value.title;
		} else {
			window.document.title = `${pageMetadata.value.title} | ${instanceName}`;
		}
	}
});
provideReactiveMetadata(pageMetadata);

const menuIndicated = computed(() => {
	for (const def in navbarItemDef) {
		if (def === 'notifications') continue; // 通知は下にボタンとして表示されてるから
		if (navbarItemDef[def].indicated) return true;
	}
	return false;
});

const drawerMenuShowing = ref(false);

mainRouter.on('change', () => {
	drawerMenuShowing.value = false;
});

if (window.innerWidth > 1024) {
	const tempUI = miLocalStorage.getItem('ui_temp');
	if (tempUI) {
		miLocalStorage.setItem('ui', tempUI);
		miLocalStorage.removeItem('ui_temp');
		window.location.reload();
	}
}

onMounted(() => {
	if (!isDesktop.value) {
		window.addEventListener('resize', () => {
			if (window.innerWidth >= DESKTOP_THRESHOLD) isDesktop.value = true;
		}, { passive: true });
	}

	globalEvents.on('showEl', (value) => showEl.value = value);
	globalEvents.on('showEl2', (value) => showEl2.value = value);
});

const onContextmenu = (ev) => {
	if (isLink(ev.target)) return;
	if (['INPUT', 'TEXTAREA', 'IMG', 'VIDEO', 'CANVAS'].includes(ev.target.tagName) || ev.target.attributes['contenteditable']) return;
	if (window.getSelection()?.toString() !== '') return;
	const path = mainRouter.getCurrentFullPath();
	os.contextMenu([{
		type: 'label',
		text: path,
	}, {
		icon: 'ti ti-window-maximize',
		text: i18n.ts.openInWindow,
		action: () => {
			os.pageWindow(path);
		},
	}], ev);
};

const navFooterHeight = ref(0);

watch(navFooter, () => {
	if (navFooter.value) {
		navFooterHeight.value = navFooter.value.offsetHeight;
		window.document.body.style.setProperty('--MI-minBottomSpacing', 'var(--MI-minBottomSpacingMobile)');
	} else {
		navFooterHeight.value = 0;
		window.document.body.style.setProperty('--MI-minBottomSpacing', '0px');
	}
}, {
	immediate: true,
});
</script>

<style lang="scss" module>
$ui-font-size: 1em; // TODO: どこかに集約したい
$widgets-hide-threshold: 1090px;

.transition_menuDrawerBg_enterActive,
.transition_menuDrawerBg_leaveActive {
	opacity: 1;
	transition: opacity 300ms cubic-bezier(0.23, 1, 0.32, 1);
}
.transition_menuDrawerBg_enterFrom,
.transition_menuDrawerBg_leaveTo {
	opacity: 0;
}

.transition_menuDrawer_enterActive,
.transition_menuDrawer_leaveActive {
	opacity: 1;
	transform: translateX(0);
	transition: transform 300ms cubic-bezier(0.23, 1, 0.32, 1), opacity 300ms cubic-bezier(0.23, 1, 0.32, 1);
}
.transition_menuDrawer_enterFrom,
.transition_menuDrawer_leaveTo {
	opacity: 0;
	transform: translateX(-240px);
}

.transition_widgetsDrawerBg_enterActive,
.transition_widgetsDrawerBg_leaveActive {
	opacity: 1;
	transition: opacity 300ms cubic-bezier(0.23, 1, 0.32, 1);
}
.transition_widgetsDrawerBg_enterFrom,
.transition_widgetsDrawerBg_leaveTo {
	opacity: 0;
}

.transition_widgetsDrawer_enterActive,
.transition_widgetsDrawer_leaveActive {
	opacity: 1;
	transform: translateX(0);
	transition: transform 300ms cubic-bezier(0.23, 1, 0.32, 1), opacity 300ms cubic-bezier(0.23, 1, 0.32, 1);
}
.transition_widgetsDrawer_enterFrom,
.transition_widgetsDrawer_leaveTo {
	opacity: 0;
	transform: translateX(-240px);
}

.transition_widgetsDrawer_right_enterActive,
.transition_widgetsDrawer_right_leaveActive {
	opacity: 1;
	transform: translateX(0);
	transition: transform 300ms cubic-bezier(0.23, 1, 0.32, 1), opacity 300ms cubic-bezier(0.23, 1, 0.32, 1);
}
.transition_widgetsDrawer_right_enterFrom,
.transition_widgetsDrawer_right_leaveTo {
	opacity: 0;
	transform: translateX(240px);
}

.root {
	height: 100dvh;
	overflow: clip;
	contain: strict;
	box-sizing: border-box;
	display: flex;
}

.sidebar {
	border-right: solid 0.5px var(--MI_THEME-divider);
}

.contents {
	display: flex;
	flex-direction: column;
	flex: 1;
	height: 100%;
	min-width: 0;
	background: var(--MI_THEME-bg);
}

.content {
	flex: 1;
	min-height: 0;
}

.nav {
	padding: 12px 12px max(12px, env(safe-area-inset-bottom, 0px)) 12px;
	display: grid;
	grid-template-columns: 1fr 1fr 1fr 1fr 1fr;
	grid-gap: 8px;
	width: 100%;
	box-sizing: border-box;
	background: var(--MI_THEME-bg);
	border-top: solid 0.5px var(--MI_THEME-divider);
  transition: opacity 0.5s, transform 0.5s;

  &.reduceAnimation {
    transition: opacity 0s, transform 0s;
  }

  &.showEl {
    transform: translateY(84.55px);
  }
}

.navButton {
	position: relative;
	padding: 0;
	aspect-ratio: 1;
	width: 100%;
	max-width: 60px;
	margin: auto;
	border-radius: 100%;
	background: var(--MI_THEME-panel);
	color: var(--MI_THEME-fg);

	&:hover {
		background: var(--MI_THEME-panelHighlight);
	}

	&:active {
		background: hsl(from var(--MI_THEME-panel) h s calc(l - 2));
	}
}

.postButton {
	composes: navButton;
	background: linear-gradient(90deg, var(--MI_THEME-buttonGradateA), var(--MI_THEME-buttonGradateB));
	color: var(--MI_THEME-fgOnAccent);

	&:hover {
		background: linear-gradient(90deg, hsl(from var(--MI_THEME-accent) h s calc(l + 5)), hsl(from var(--MI_THEME-accent) h s calc(l + 5)));
	}

	&:active {
		background: linear-gradient(90deg, hsl(from var(--MI_THEME-accent) h s calc(l + 5)), hsl(from var(--MI_THEME-accent) h s calc(l + 5)));
	}
}

.navButtonIcon {
	font-size: 16px;
	vertical-align: middle;
}

.navButtonIndicator {
	position: absolute;
	top: 0;
	left: 0;
	color: var(--MI_THEME-indicator);
	font-size: 16px;

	&:has(.itemIndicateValueIcon) {
		animation: none;
		font-size: 10px;
	}
}

.menuDrawerBg {
	z-index: 1001;
}

.menuDrawer {
	position: fixed;
	top: 0;
	left: 0;
	z-index: 1001;
	height: 100dvh;
	width: 240px;
	box-sizing: border-box;
	contain: strict;
	overflow: auto;
	overscroll-behavior: contain;
	background: var(--MI_THEME-navBg);
}

.statusbars {
	position: sticky;
	top: 0;
	left: 0;
}

.widgets {
	width: 350px;
	height: 100%;
	box-sizing: border-box;
	overflow: auto;
	padding: var(--MI-margin) var(--MI-margin) calc(var(--MI-margin) + env(safe-area-inset-bottom, 0px));
	border-left: solid 0.5px var(--MI_THEME-divider);
	background: var(--MI_THEME-bg);

	@media (max-width: $widgets-hide-threshold) {
		display: none;
	}
}

.widgetsDrawerBg {
	z-index: 1001;
}

.widgetsDrawer {
	position: fixed;
	top: 0;
	left: 0;
	right: auto;
	z-index: 1001;
	width: 310px;
	height: 100dvh;
	padding: var(--MI-margin) var(--MI-margin) calc(var(--MI-margin) + env(safe-area-inset-bottom, 0px)) !important;
	box-sizing: border-box;
	overflow: auto;
	overscroll-behavior: contain;
	background: var(--MI_THEME-bg);
}

.widgetsDrawerRight {
	left: auto;
	right: 0;
}

.widgetsCloseButton {
	padding: 8px;
	display: block;
	margin: 0 auto;
}

@media (min-width: 370px) {
	.widgetsCloseButton {
		display: none;
	}
}
</style>
