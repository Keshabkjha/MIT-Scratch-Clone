import React, { useState, useEffect } from 'react';
import { Box, Modal, Tab, Tabs, Button, IconButton, CircularProgress } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import DeleteIcon from '@mui/icons-material/Delete';

const defaultSprites = [
    { name: 'Cat', url: require('../Assets/images/cat.png') },
    { name: 'Jerry', url: require('../Assets/images/jerry1.png') },
    { name: 'Mickey', url: require('../Assets/images/Mickey_Mouse.png') },
    { name: 'Sonic', url: require('../Assets/images/Sonic.png') },
    { name: 'Mario', url: require('../Assets/images/mario.png') },
    {name: 'Iron Man', url: require('../Assets/images/iron_man.png')}
];

const defaultBackdrops = [
    { name: 'Forest', url: 'https://www.hp.com/us-en/shop/app/assets/images/uploads/prod/misty-forest-background1595620320482968.jpg' },
    { name: 'Space', url: 'https://images.unsplash.com/photo-1534796636912-3b95b3ab5986' },
    { name: 'Beach', url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e' },
    { name: 'City', url: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df' },
    { name: 'Mountains', url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b' }
];

// Image cache to store preloaded images
const imageCache = new Map();

// Function to preload an image
const preloadImage = (url) => {
    if (imageCache.has(url)) {
        return Promise.resolve(imageCache.get(url));
    }

    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            imageCache.set(url, img);
            resolve(img);
        };
        img.onerror = reject;
        img.src = url;
    });
};

const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 600,
    bgcolor: 'background.paper',
    boxShadow: 24,
    p: 4,
    borderRadius: 2,
    maxHeight: '80vh',
    overflow: 'auto'
};

export const LibraryModal = ({ open, onClose, type, onSelect, onUpload, onDelete, currentItem }) => {
    const [activeTab, setActiveTab] = useState(0);
    const [loadingImages, setLoadingImages] = useState({});
    const [preloadedImages, setPreloadedImages] = useState(new Set());

    useEffect(() => {
        if (open && type === 'backdrop') {
            // Preload all backdrop images when modal opens
            defaultBackdrops.forEach(backdrop => {
                if (!preloadedImages.has(backdrop.url)) {
                    setLoadingImages(prev => ({ ...prev, [backdrop.url]: true }));
                    preloadImage(backdrop.url)
                        .then(() => {
                            setPreloadedImages(prev => new Set([...prev, backdrop.url]));
                            setLoadingImages(prev => ({ ...prev, [backdrop.url]: false }));
                        })
                        .catch(error => {
                            console.error('Error preloading image:', error);
                            setLoadingImages(prev => ({ ...prev, [backdrop.url]: false }));
                        });
                }
            });
        }
    }, [open, type, preloadedImages]);

    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
    };

    const handleFileUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                onUpload(e.target.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const items = type === 'sprite' ? defaultSprites : defaultBackdrops;

    return (
        <Modal open={open} onClose={onClose}>
            <Box sx={style}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <h2>{type === 'sprite' ? 'Choose a Sprite' : 'Choose a Image'}</h2>
                    <IconButton onClick={onClose}>
                        <CloseIcon />
                    </IconButton>
                </Box>

                <Tabs value={activeTab} onChange={handleTabChange}>
                    <Tab label="Library" />
                    <Tab label="Upload" />
                </Tabs>

                {activeTab === 0 && (
                    <Box sx={{ mt: 2, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2 }}>
                        {items.map((item, index) => (
                            <Box 
                                key={index}
                                sx={{
                                    border: '1px solid #ddd',
                                    borderRadius: 1,
                                    p: 1,
                                    cursor: 'pointer',
                                    '&:hover': { bgcolor: '#f5f5f5' },
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    position: 'relative',
                                    minHeight: type === 'sprite' ? '150px' : '130px'
                                }}
                                onClick={() => onSelect(item.url)}
                            >
                                {loadingImages[item.url] ? (
                                    <Box sx={{ 
                                        display: 'flex', 
                                        justifyContent: 'center', 
                                        alignItems: 'center',
                                        height: type === 'sprite' ? '100px' : '80px',
                                        width: '100%'
                                    }}>
                                        <CircularProgress size={24} />
                                    </Box>
                                ) : (
                                <img 
                                    src={item.url} 
                                    alt={item.name}
                                    style={{ 
                                        width: '100%', 
                                        height: type === 'sprite' ? '100px' : '80px',
                                        objectFit: type === 'sprite' ? 'contain' : 'cover'
                                    }}
                                />
                                )}
                                <Box sx={{ mt: 1 }}>{item.name}</Box>
                            </Box>
                        ))}
                    </Box>
                )}

                {activeTab === 1 && (
                    <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                        <Button
                            variant="contained"
                            component="label"
                            startIcon={<FileUploadIcon />}
                        >
                            Upload {type === 'sprite' ? 'Sprite' : 'Backdrop'}
                            <input
                                type="file"
                                hidden
                                accept="image/*"
                                onChange={handleFileUpload}
                            />
                        </Button>
                        {currentItem && (
                            <Button
                                variant="outlined"
                                color="error"
                                startIcon={<DeleteIcon />}
                                onClick={onDelete}
                            >
                                Remove Current {type === 'sprite' ? 'Sprite' : 'Backdrop'}
                            </Button>
                        )}
                    </Box>
                )}
            </Box>
        </Modal>
    );
};

export default LibraryModal; 
