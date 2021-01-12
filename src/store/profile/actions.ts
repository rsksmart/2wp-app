import { ActionTree } from 'vuex';
import axios from 'axios';
import { ProfileState, User } from './types';
import { RootState } from '../types';

export const actions: ActionTree<ProfileState, RootState> = {
  fetchData({ commit }): any {
    axios({
      url: 'https://....',
    })
      .then((response) => {
        const payload: User = response && response.data;
        commit('profileLoaded', payload);
      }, (error) => {
        console.log(error);
        const payload: User = {
          firstName: 'Ronald',
          lastName: 'Sarmiento',
          email: 'a@a.aa',
          phone: '3156830358',
        };
        commit('profileLoaded', payload);
      });
  },
};
