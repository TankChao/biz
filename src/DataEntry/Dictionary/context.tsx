import React from 'react';
import { type DictionaryConfig } from './cache';

export const DictionaryConfigContext = React.createContext<DictionaryConfig | null>(null);
