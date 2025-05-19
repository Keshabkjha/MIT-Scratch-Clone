import React from 'react';
import { Modal, Box, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#4C97FF', '#9966FF', '#CF63CF', '#FFAB19', '#FFD500', '#5CB1D6', '#59C059', '#FF8C1A', '#FF6680'];

const AnalyticsDashboard = ({ open, onClose, actionQueue }) => {
    // Process data for charts
    const spriteActionCounts = actionQueue.reduce((acc, action) => {
        acc[`Sprite ${action.spriteId}`] = (acc[`Sprite ${action.spriteId}`] || 0) + 1;
        return acc;
    }, {});

    const blockTypeCounts = actionQueue.reduce((acc, action) => {
        acc[action.type] = (acc[action.type] || 0) + 1;
        return acc;
    }, {});

    const barChartData = Object.entries(spriteActionCounts).map(([name, value]) => ({
        name,
        value
    }));

    const pieChartData = Object.entries(blockTypeCounts).map(([name, value]) => ({
        name,
        value
    }));

    const totalActions = actionQueue.length;

    return (
        <Modal open={open} onClose={onClose}>
            <Box sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '80%',
                maxWidth: 1000,
                bgcolor: 'background.paper',
                boxShadow: 24,
                p: 4,
                borderRadius: 2,
                maxHeight: '90vh',
                overflow: 'auto'
            }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <h2 className="text-2xl font-bold text-gray-800">Analytics Dashboard</h2>
                    <IconButton onClick={onClose}>
                        <CloseIcon />
                    </IconButton>
                </Box>

                {/* KPI Counter */}
                <Box sx={{ mb: 4, p: 3, bgcolor: '#f8fafc', borderRadius: 2 }}>
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">Total Actions</h3>
                    <p className="text-4xl font-bold text-blue-600">{totalActions}</p>
                </Box>

                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 4 }}>
                    {/* Bar Chart */}
                    <Box sx={{ flex: 1, p: 3, bgcolor: '#f8fafc', borderRadius: 2 }}>
                        <h3 className="text-lg font-semibold text-gray-700 mb-4">Actions by Sprite</h3>
                        <BarChart width={400} height={300} data={barChartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="value" fill="#4C97FF" />
                        </BarChart>
                    </Box>

                    {/* Pie Chart */}
                    <Box sx={{ flex: 1, p: 3, bgcolor: '#f8fafc', borderRadius: 2 }}>
                        <h3 className="text-lg font-semibold text-gray-700 mb-4">Block Types Distribution</h3>
                        <PieChart width={400} height={300}>
                            <Pie
                                data={pieChartData}
                                cx={200}
                                cy={150}
                                labelLine={false}
                                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                                outerRadius={100}
                                fill="#8884d8"
                                dataKey="value"
                            >
                                {pieChartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                        </PieChart>
                    </Box>
                </Box>
            </Box>
        </Modal>
    );
};

export default AnalyticsDashboard; 