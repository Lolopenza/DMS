import React from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { DEFAULT_SUBJECT } from '../routes.js';

export default function Calculator() {
  const { subject } = useParams();
  const activeSubject = subject || DEFAULT_SUBJECT;
  return <Navigate to={`/${activeSubject}`} replace />;
}
