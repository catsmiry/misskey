<!--
SPDX-FileCopyrightText: syuilo and misskey-project
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<div class="_gaps_m">
	<MkFolder :defaultOpen="true">
		<template #icon><i class="ti ti-plane-arrival"></i></template>
		<template #label>{{ i18n.ts._accountMigration.moveFrom }}</template>
		<template #caption>{{ i18n.ts._accountMigration.moveFromSub }}</template>

		<div class="_gaps_m">
			<FormInfo>
				{{ i18n.ts._accountMigration.moveFromDescription }}
			</FormInfo>
			<div>
				<MkButton :disabled="accountAliases.length >= 10" inline style="margin-right: 8px;" @click="add"><i class="ti ti-plus"></i> {{ i18n.ts.add }}</MkButton>
				<MkButton inline primary @click="save"><i class="ti ti-check"></i> {{ i18n.ts.save }}</MkButton>
			</div>
			<div class="_gaps">
				<MkInput v-for="(_, i) in accountAliases" v-model="accountAliases[i]">
					<template #prefix><i class="ti ti-plane-arrival"></i></template>
					<template #label>{{ i18n.tsx._accountMigration.moveFromLabel({ n: i + 1 }) }}</template>
				</MkInput>
			</div>
		</div>
	</MkFolder>

	<MkFolder :defaultOpen="!!$i.movedTo">
		<template #icon><i class="ti ti-plane-departure"></i></template>
		<template #label>{{ i18n.ts._accountMigration.moveTo }}</template>

		<div class="_gaps_m">
			<FormInfo>{{ i18n.ts._accountMigration.moveAccountDescription }}</FormInfo>

			<template v-if="$i && !$i.movedTo">
				<FormInfo>{{ i18n.ts._accountMigration.moveAccountHowTo }}</FormInfo>
				<FormInfo warn>{{ i18n.ts._accountMigration.moveCannotBeUndone }}</FormInfo>

				<MkInput v-model="moveToAccount">
					<template #prefix><i class="ti ti-plane-departure"></i></template>
					<template #label>{{ i18n.ts._accountMigration.moveToLabel }}</template>
				</MkInput>
				<MkButton inline danger :disabled="!moveToAccount" @click="move">
					<i class="ti ti-check"></i> {{ i18n.ts._accountMigration.startMigration }}
				</MkButton>
			</template>
			<template v-else-if="$i">
				<FormInfo>{{ i18n.ts._accountMigration.postMigrationNote }}</FormInfo>
				<FormInfo warn>{{ i18n.ts._accountMigration.movedAndCannotBeUndone }}</FormInfo>
				<div>{{ i18n.ts._accountMigration.movedTo }}</div>
				<MkUserInfo v-if="movedTo" :user="movedTo" class="_panel _shadow"/>
			</template>
		</div>
	</MkFolder>
</div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import * as Misskey from 'cherrypick-js';
import FormInfo from '@/components/MkInfo.vue';
import MkInput from '@/components/MkInput.vue';
import MkButton from '@/components/MkButton.vue';
import MkFolder from '@/components/MkFolder.vue';
import MkUserInfo from '@/components/MkUserInfo.vue';
import * as os from '@/os.js';
import { misskeyApi } from '@/utility/misskey-api.js';
import { i18n } from '@/i18n.js';
import { ensureSignin } from '@/i.js';
import { unisonReload } from '@/utility/unison-reload.js';

const $i = ensureSignin();

const moveToAccount = ref('');
const movedTo = ref<Misskey.entities.UserDetailed>();
const accountAliases = ref(['']);

async function init() {
	if ($i.movedTo) {
		movedTo.value = await misskeyApi('users/show', { userId: $i.movedTo });
	} else {
		moveToAccount.value = '';
	}

	if ($i.alsoKnownAs && $i.alsoKnownAs.length > 0) {
		const alsoKnownAs = await misskeyApi('users/show', { userIds: $i.alsoKnownAs });
		accountAliases.value = (alsoKnownAs && alsoKnownAs.length > 0) ? alsoKnownAs.map(user => `@${Misskey.acct.toString(user)}`) : [''];
	} else {
		accountAliases.value = [''];
	}
}

async function move(): Promise<void> {
	const account = moveToAccount.value;
	const confirm = await os.confirm({
		type: 'warning',
		text: i18n.tsx._accountMigration.migrationConfirm({ account }),
	});
	if (confirm.canceled) return;
	await os.apiWithDialog('i/move', {
		moveToAccount: account,
	});
	unisonReload();
}

function add(): void {
	accountAliases.value.push('');
}

async function save(): Promise<void> {
	const alsoKnownAs = accountAliases.value.map(alias => alias.trim()).filter(alias => alias !== '');
	const i = await os.apiWithDialog('i/update', {
		alsoKnownAs,
	});
	$i.alsoKnownAs = i.alsoKnownAs;
	init();
}

init();
</script>

<style lang="scss" module>
.description {
	font-size: .85em;
	padding: 1rem;
}
</style>
