<!--
SPDX-FileCopyrightText: syuilo and misskey-project
SPDX-License-Identifier: AGPL-3.0-only
-->

<script lang="ts">
import { defineComponent, h, resolveDirective, withDirectives } from 'vue';

export default defineComponent({
	props: {
		modelValue: {
			required: true,
		},
	},
	setup(props, { emit, slots }) {
		const options = slots.default?.() ?? [];

		return () => h('div', {
			class: 'pxhvhrfw',
		}, options.map(option => withDirectives(h('button', {
			class: ['_button', { active: props.modelValue === option.props?.value }],
			key: option.key as string,
			disabled: props.modelValue === option.props?.value,
			onClick: () => {
				emit('update:modelValue', option.props?.value);
			},
		}, option.children ?? []), [
			[resolveDirective('click-anime')],
		])));
	},
});
</script>

<style lang="scss" scoped>
.pxhvhrfw {
	display: flex;
	font-size: 90%;

	> button {
		flex: 1;
		padding: 10px 8px;
		border-radius: 999px;

		&:disabled {
			opacity: 1 !important;
			cursor: default;
		}

		&.active {
			color: var(--MI_THEME-accent);
			background: var(--MI_THEME-accentedBg);
		}

		&:not(.active):hover {
			color: var(--MI_THEME-fgHighlighted);
			background: var(--MI_THEME-panelHighlight);
		}

		&:not(:first-child) {
			margin-left: 8px;
		}

		> .icon {
			margin-right: 6px;
		}
	}
}

@container (max-width: 500px) {
	.pxhvhrfw {
		font-size: 80%;

		> button {
			padding: 11px 8px;
		}
	}
}
</style>
