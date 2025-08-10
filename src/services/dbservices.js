import axios from 'axios';
import { useToast } from 'vue-toastification'; // import toast composable

const toast = useToast();

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 5000,
});

function handleError(error, message){
  const errorMessage = error.response?.data?.message || 'Onbekende fout, sorry';
  toast.error(`${message}: ${errorMessage}`, {
    timeout: 5000,
    position: 'top-right',
  });
  return {
    success: false,
    error: error.message,
  }
}

async function get(endpoint, params = {}) {
  try {
    const response = await apiClient.get(endpoint, { params });
    return response.data;
  } catch (error) {
    return handleError(error, message);
  }
}

async function post(endpoint, body = {}, config = {}, message) {
  try {
    const response = await apiClient.post(endpoint, body, config);
    return { success: true, data: response.data };
  } catch (error) {
    return handleError(error, message);
  }
}

// Algemene PUT helper
async function put(endpoint, body = {}, message) {
  try {
    const response = await apiClient.put(endpoint, body);
    return { success: true, data: response.data };
  } catch (error) {
    return handleError(error, message);
  }
}

// Algemene DELETE helper
async function remove(endpoint, message) {
  try {
    const response = await apiClient.delete(endpoint);
    return { success: true, data: response.data };
  } catch (error) {
    return handleError(error, message);
  }
}

const dbService = {

  fetchToernooien: () =>
    get('/toernooien', {}, 'Fout bij het ophalen van toernooien'),

  fetchToernooi: (id) =>
    get(`/toernooien/${id}`, {}, `Fout bij het ophalen van toernooi ${id}`),

  getToernooiIdByDate: (date) => {
    const dateObj = new Date(date);
    return get(
      '/tournamentID',
      { datum: dateObj.toISOString() },
      'Fout bij het ophalen van toernooi ID'
    );
  },

  saveToernooi: (toernooiData) =>
    post('/toernooien', toernooiData, {}, 'Fout bij het opslaan van toernooi'),

  updateToernooi: (id, toernooiData) =>
    put(`/toernooien/${id}`, toernooiData, `Fout bij het updaten van toernooi ${id}`),

  deleteToernooi: (id) =>
    remove(`/toernooien/${id}`, `Fout bij het verwijderen van toernooi ${id}`),

  fetchSavedTeams: () =>
    get('/savedTeams', {}, 'Fout bij het ophalen van teams'),

  saveStandardTeams: (teams) =>
    post('/standardTeams', { teams }, {}, 'Fout bij het opslaan van standaard teams'),

  checkServer: async () => {
    try {
      const response = await apiClient.get('/ping', { timeout: 3000 });
      return { success: response.status === 200 };
    } catch {
      toast.error('Kan de server niet bereiken, controleer je verbinding', {
        timeout: 5000,
        position: 'top-right',
      });
      return { success: false };
    }
  },

  fetchRanking: () =>
    get('/ranking', {}, 'Fout bij het ophalen van ranking'),

  postPDF: (formData) =>
    post(
      '/upload',
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } },
      'Fout bij het uploaden van PDF'
    ),

  fetchPDF: (pdfUrl) =>
    get(`/pdf-exists/${pdfUrl}`, {}, 'Fout bij het ophalen van PDF'),
};  
 

export default dbService;