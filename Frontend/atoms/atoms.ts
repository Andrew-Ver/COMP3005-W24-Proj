import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';

/*
    This atom will contain all user data from the UserAtom component
    It will be used to store the user data in the global state and be both readable and writeable for all of its object keys
*/

export const currentUsernameAtom = atomWithStorage('currentUsername', '');
export const currentNameAtom = atomWithStorage('currentName', '');
export const currentRoleAtom = atomWithStorage('currentRole', '');
