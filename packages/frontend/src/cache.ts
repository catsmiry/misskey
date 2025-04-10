/*
 * SPDX-FileCopyrightText: syuilo and misskey-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import * as Misskey from 'cherrypick-js';
import { Cache } from '@/utility/cache.js';
import { misskeyApi } from '@/utility/misskey-api.js';

export const clipsCache = new Cache<Misskey.entities.Clip[]>(1000 * 60 * 30, () => misskeyApi('clips/list'));
export const rolesCache = new Cache(1000 * 60 * 30, () => misskeyApi('admin/roles/list'));
export const userListsCache = new Cache<Misskey.entities.UserList[]>(1000 * 60 * 30, () => misskeyApi('users/lists/list'));
export const antennasCache = new Cache<Misskey.entities.Antenna[]>(1000 * 60 * 30, () => misskeyApi('antennas/list'));
export const favoritedChannelsCache = new Cache<Misskey.entities.Channel[]>(1000 * 60 * 30, () => misskeyApi('channels/my-favorites', { limit: 100 }));
