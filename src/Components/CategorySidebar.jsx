import React from 'react';
import { Box } from '@mui/material';
import DirectionsRunIcon from '@mui/icons-material/DirectionsRun';
import VisibilityIcon from '@mui/icons-material/Visibility';
import SettingsIcon from '@mui/icons-material/Settings';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import EventIcon from '@mui/icons-material/Event';
import SensorsIcon from '@mui/icons-material/Sensors';
import FunctionsIcon from '@mui/icons-material/Functions';
import DataArrayIcon from '@mui/icons-material/DataArray';
import ExtensionIcon from '@mui/icons-material/Extension';

const categories = [
    { name: 'Motion', icon: DirectionsRunIcon, color: '#4C97FF' },
    { name: 'Looks', icon: VisibilityIcon, color: '#9966FF' },
    { name: 'Sound', icon: VolumeUpIcon, color: '#CF63CF' },
    { name: 'Control', icon: SettingsIcon, color: '#FFAB19' },
    { name: 'Events', icon: EventIcon, color: '#FFD500' },
    { name: 'Sensing', icon: SensorsIcon, color: '#5CB1D6' },
    { name: 'Operators', icon: FunctionsIcon, color: '#59C059' },
    { name: 'Variables', icon: DataArrayIcon, color: '#FF8C1A' },
    { name: 'My Blocks', icon: ExtensionIcon, color: '#FF6680' }
];

export const CategorySidebar = ({ activeCategory, onCategoryClick }) => {
    return (
        <Box
            className="category-sidebar"
            sx={{
                width: { xs: '100%', lg: '60px' },
                backgroundColor: '#ffffff',
                borderRight: { xs: 'none', lg: '1px solid #e0e0e0' },
                borderBottom: { xs: '1px solid #e0e0e0', lg: 'none' },
                display: 'flex',
                flexDirection: { xs: 'row', lg: 'column' },
                gap: { xs: '4px', lg: '8px' },
                padding: { xs: '8px', lg: '8px 0' },
                height: { xs: 'auto', lg: '70vh' },
                overflowX: { xs: 'auto', lg: 'hidden' },
                overflowY: { xs: 'hidden', lg: 'auto' },
                boxShadow: { xs: 'none', lg: '0 4px 12px rgba(0,0,0,0.08)' }
            }}
        >
            {categories.map((category) => {
                const Icon = category.icon;
                const isActive = activeCategory === category.name;
                
                return (
                    <Box
                        key={category.name}
                        onClick={() => onCategoryClick(category.name)}
                        sx={{
                            width: { xs: 'auto', lg: '100%' },
                            minWidth: { xs: '72px', lg: 'auto' },
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            padding: { xs: '6px 4px', lg: '8px 0' },
                            cursor: 'pointer',
                            backgroundColor: isActive ? `${category.color}20` : 'transparent',
                            borderLeft: {
                                xs: '4px solid transparent',
                                lg: isActive ? `4px solid ${category.color}` : '4px solid transparent'
                            },
                            borderBottom: {
                                xs: isActive ? `3px solid ${category.color}` : '3px solid transparent',
                                lg: 'none'
                            },
                            borderRadius: { xs: '8px', lg: '0' },
                            '&:hover': {
                                backgroundColor: `${category.color}10`,
                            }
                        }}
                    >
                        <Icon sx={{ color: category.color }} />
                        <Box
                            sx={{
                                fontSize: '10px',
                                textAlign: 'center',
                                marginTop: '4px',
                                color: '#575e75',
                                fontFamily: 'monospace'
                            }}
                        >
                            {category.name}
                        </Box>
                    </Box>
                );
            })}
        </Box>
    );
};

export default CategorySidebar; 
