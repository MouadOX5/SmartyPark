// URL de base de l'API backend Spring Boot.
// Par défaut, on suppose que le dashboard tourne sur la même machine que le
// backend. Pour y accéder depuis un autre poste sur le réseau, définir
// VITE_API_BASE_URL dans un fichier .env (voir .env.example).
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

export const APP_NAME = 'SmartyPark Admin';
