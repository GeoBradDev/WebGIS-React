import { Box, Typography, Paper, Grid } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const Dashboard = ({ data }) => {

    const columns = [
        { field: 'id', headerName: 'ID', width: 90 },
        { field: 'MUNICIPALITY', headerName: 'Municipality', width: 200 },
        { field: 'MUNI', headerName: 'MUNI', width: 100 },
        { field: 'MUNICODE', headerName: 'MUNI Code', width: 120 },
        { field: 'LABELTXT', headerName: 'Label', width: 100 },
        { field: 'SQ_MILES', headerName: 'Square Miles', width: 150 },
    ];

    const rows = data.map((row, index) => ({ ...row, id: index }));

    const pieData = data
        .filter(d => d.SQ_MILES)
        .map(item => ({ name: item.MUNICIPALITY, value: item.SQ_MILES }));

    const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#d0ed57', '#a4de6c', '#8dd1e1'];

    return (
        <Box sx={{ padding: 2, overflow: 'auto', height: '100%' }}>
            <Typography variant="h5" gutterBottom>
                GIS Dashboard
            </Typography>

            <Paper sx={{ height: 400, width: '100%', mb: 4 }}>
                <DataGrid rows={rows} columns={columns} pageSize={10} />
            </Paper>

            <Typography variant="h6" gutterBottom>
                Area (Square Miles) by Municipality
            </Typography>

            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={rows}>
                    <XAxis dataKey="MUNICIPALITY" angle={-45} textAnchor="end" height={80}/>
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="SQ_MILES" fill="#8884d8" />
                </BarChart>
            </ResponsiveContainer>

            <Grid container columns={12} spacing={2} sx={{ mt: 2 }}>
                <Grid gridColumn="span 12" md={6}>
                    <Typography variant="h6">Municipality Size Distribution</Typography>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie data={pieData} dataKey="value" nameKey="name" outerRadius={100}>
                                {pieData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </Grid>

                <Grid gridColumn="span 12">
                    <Typography variant="h6">Top 5 Largest Municipalities</Typography>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={[...rows].sort((a, b) => b.SQ_MILES - a.SQ_MILES).slice(0,5)}>
                            <XAxis dataKey="MUNICIPALITY" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="SQ_MILES" fill="#82ca9d" />
                        </BarChart>
                    </ResponsiveContainer>
                </Grid>
            </Grid>
        </Box>
    );
};

export default Dashboard;
