import React from 'react';
import { Redirect, useLocalSearchParams } from 'expo-router';

export default function DeprecatedSignalementRedirect() {
  const params = useLocalSearchParams<{ id?: string; espaceId?: string; nom?: string; espaceNom?: string }>();
  const id = params.id || params.espaceId;
  const nom = params.nom || params.espaceNom;
  return <Redirect href={`/signalements/creer?id=${id}&nom=${nom || ''}`} />;
}
