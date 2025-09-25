import axios from 'axios';
import { useToast } from 'vue-toastification'; // import toast composable

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 5000,
});

const toast = useToast();

function handleError(error, message) {
  const errorMessage = error.response?.data?.message || error.message || 'Onbekende fout';
  toast.error(`${message}: ${errorMessage}`, {
    timeout: 5000,
    position: 'top-center',
  });
  return {
    success: false,
    error: errorMessage,
  };
}

async function get(endpoint, params = {}, message) {
  try {
    const response = await apiClient.get(endpoint, { params });
    return { success: true, data: response.data };
  } catch (error) {
    return handleError(error, message);
  }
}

async function post(endpoint, body = {}, config = {}, message) {
  try {
//    console.log("POST request to:", endpoint, "with body:", body);
    const response = await apiClient.post(endpoint, body, config);
    return { success: true, data: response.data };
  } catch (error) {
    return handleError(error, message);
  }
}

async function put(endpoint, body = {}, message) {
  try {
    const response = await apiClient.put(endpoint, body);
    return { success: true, data: response.data };
  } catch (error) {
    return handleError(error, message);
  }
}

async function remove(endpoint, message) {
  try {
    const response = await apiClient.delete(endpoint);
    return { success: true, data: response.data };
  } catch (error) {
    return handleError(error, message);
  }
}

const dbService = {
  fetchToernooien: async () =>
    await get('/toernooien', {}, 'Fout bij het ophalen van toernooien'),

  fetchToernooi: async (id) =>
    await get(`/toernooien/${id}`, {}, `Fout bij het ophalen van toernooi ${id}`),

  getToernooiIdByDate: async (date) => {
    const dateObj = new Date(date);
    return await get(
      '/tournamentID',
      { datum: dateObj.toISOString() },
      'Fout bij het ophalen van toernooi ID'
    );
  },

  fetchAllPlayers: async () => 
    await get('/spelers', {}, 'Fout bij het ophalen van spelers'),

  saveToernooi: async (toernooiData) => {
//    // console.log("Toernooi data om op te slaan:", toernooiData);
    const response = await post('/toernooien', toernooiData, {}, 'Fout bij het opslaan van toernooi');
    return response;
  },

  updateToernooi: async (id, toernooiData) =>
    await put(`/toernooien/${id}`, toernooiData, `Fout bij het updaten van toernooi ${id}`),

  deleteToernooi: async (id) =>
    await remove(`/toernooien/${id}`, `Fout bij het verwijderen van toernooi ${id}`),

  // TODO Voeg een veld toe in de toernooien tabel voor de naam van de gegenereerde pdf. Dan kan die meteen worden verwijderd

  fetchSavedTeams: async () =>
    await get('/savedTeams', {}, 'Fout bij het ophalen van teams'),

  saveStandardTeams: async (teams) =>
    await post('/standardTeams', teams, {}, 'Fout bij het opslaan van standaard teams'),

  checkServer: async () => {
    try {
      const response = await apiClient.get('/ping', { timeout: 3000 });
      return { success: response.status === 200 };
    } catch {
      toast.error('Database server niet bereikbaar', { position: 'top-center' });
      return { success: false };
    }
  },

  fetchRanking: async () =>
    await get('/ranking', {}, 'Fout bij het ophalen van ranking'),

  postPDF: async (formData) =>
    await post(
      '/upload',
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } },
      'Fout bij het uploaden van PDF'
    ),

  fetchPDF: async (pdfUrl) => {
    const result = await get(`/pdf-exists/${pdfUrl}`, {}, 'Fout bij het ophalen van PDF status');
////    console.log('PDF fetch result:', result);
    return result.data.exists;
  }
};

export default dbService;
