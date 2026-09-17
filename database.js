// Cloud Database - JSONBin.io
const CLOUD_DB = {
    API_KEY: '$2a$10$/7vQOXxlwM7lvNEHDIPDGO41446TxVu5gpN4yT989qTPdGrd2HJSi',
    BIN_ID: '6aab9869ffd5d1605310f1da',
    BASE_URL: 'https://api.jsonbin.io/v3',
    
    headers() {
        return {
            'X-Master-Key': this.API_KEY,
            'Content-Type': 'application/json'
        };
    },
    
    // Read all data
    async read() {
        try {
            const res = await fetch(`${this.BASE_URL}/b/${this.BIN_ID}/latest`, {
                headers: this.headers()
            });
            const data = await res.json();
            return data.record;
        } catch (e) {
            console.error('DB Read error:', e);
            return null;
        }
    },
    
    // Write all data
    async write(data) {
        try {
            const res = await fetch(`${this.BASE_URL}/b/${this.BIN_ID}`, {
                method: 'PUT',
                headers: this.headers(),
                body: JSON.stringify(data)
            });
            const result = await res.json();
            return result;
        } catch (e) {
            console.error('DB Write error:', e);
            return null;
        }
    },
    
    // Add parent
    async addParent(parentData) {
        const data = await this.read();
        if (!data) return null;
        
        if (!data.parents) data.parents = [];
        data.parents.push(parentData);
        data.meta.lastUpdated = new Date().toISOString();
        data.meta.totalParents = data.parents.length;
        
        const totalStudents = data.parents.reduce((sum, p) => sum + (p.students ? p.students.length : 0), 0);
        data.meta.totalStudents = totalStudents;
        
        return await this.write(data);
    },
    
    // Update parent
    async updateParent(id, updates) {
        const data = await this.read();
        if (!data) return null;
        
        const index = data.parents.findIndex(p => p.id === id);
        if (index !== -1) {
            data.parents[index] = { ...data.parents[index], ...updates };
            data.meta.lastUpdated = new Date().toISOString();
            return await this.write(data);
        }
        return null;
    },
    
    // Delete parent
    async deleteParent(id) {
        const data = await this.read();
        if (!data) return null;
        
        data.parents = data.parents.filter(p => p.id !== id);
        data.meta.lastUpdated = new Date().toISOString();
        data.meta.totalParents = data.parents.length;
        data.meta.totalStudents = data.parents.reduce((sum, p) => sum + (p.students ? p.students.length : 0), 0);
        
        return await this.write(data);
    },
    
    // Get all parents
    async getAllParents() {
        const data = await this.read();
        return data ? (data.parents || []) : [];
    },
    
    // Get statistics
    async getStats() {
        const data = await this.read();
        if (!data || !data.parents) return null;
        
        const parents = data.parents;
        const stats = {
            totalParents: parents.length,
            totalStudents: parents.reduce((sum, p) => sum + (p.students ? p.students.length : 0), 0),
            studentsByLevel: {},
            parentsByMonth: {},
            recentParents: []
        };
        
        // Count students by level
        parents.forEach(p => {
            if (p.students) {
                p.students.forEach(s => {
                    const level = s.levelName || s.level;
                    stats.studentsByLevel[level] = (stats.studentsByLevel[level] || 0) + 1;
                });
            }
        });
        
        // Count parents by month
        parents.forEach(p => {
            if (p.loginDate) {
                const month = p.loginDate.substring(0, 7);
                stats.parentsByMonth[month] = (stats.parentsByMonth[month] || 0) + 1;
            }
        });
        
        // Recent parents (last 10)
        stats.recentParents = parents
            .sort((a, b) => new Date(b.loginDate || 0) - new Date(a.loginDate || 0))
            .slice(0, 10);
        
        return stats;
    },
    
    // Export to CSV
    async exportCSV() {
        const parents = await this.getAllParents();
        if (parents.length === 0) return null;
        
        let csv = 'الاسم,البريد الإلكتروني,رقم الهاتف,التلاميذ,المستوى,تاريخ التسجيل\n';
        
        parents.forEach(p => {
            const students = p.students ? p.students.map(s => `${s.name} (${s.levelName || s.level})`).join(' + ') : '';
            const levels = p.students ? p.students.map(s => s.levelName || s.level).join(' + ') : '';
            csv += `"${p.name}","${p.email || ''}","${p.phone || ''}","${students}","${levels}","${p.loginDate || ''}"\n`;
        });
        
        return csv;
    }
};
