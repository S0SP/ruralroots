import React from 'react';
import styled from 'styled-components';
import { Chip, ChipProps } from '@mui/material';

const StatusChip = styled(Chip)<{ status: 'solved' | 'in-progress' | 'new' }>(({ theme, status }) => ({
  backgroundColor: status === 'solved' 
    ? '#4CAF50' 
    : status === 'in-progress' 
    ? '#FFA726' 
    : '#2196F3',
  color: '#fff',
  fontWeight: 'bold',
})) as React.ComponentType<ChipProps & { status: 'solved' | 'in-progress' | 'new' }>;

export default StatusChip; 