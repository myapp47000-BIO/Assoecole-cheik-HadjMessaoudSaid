// Cloud Database - localStorage as primary, cloud sync optional
const CLOUD_DB = {
    // Read all data from localStorage
    read() {
        try {
            var data = localStorage.getItem('ecole_parents_db');
            if (data) {
                return JSON.parse(data);
            }
            // Initialize empty database
            var initial = {
                parents: [],
                meta: {
                    lastUpdated: new Date().toISOString(),
                    totalParents: 0,
                    totalStudents: 0
                }
            };
            localStorage.setItem('ecole_parents_db', JSON.stringify(initial));
            return initial;
        } catch (e) {
            console.error('DB Read error:', e);
            return { parents: [], meta: {} };
        }
    },
    
    // Write all data to localStorage
    write(data) {
        try {
            data.meta.lastUpdated = new Date().toISOString();
            data.meta.totalParents = data.parents.length;
            data.meta.totalStudents = data.parents.reduce(function(sum, p) {
                return sum + (p.students ? p.students.length : 0);
            }, 0);
            localStorage.setItem('ecole_parents_db', JSON.stringify(data));
            return true;
        } catch (e) {
            console.error('DB Write error:', e);
            return false;
        }
    },
    
    // Add parent
    addParent(parentData) {
        var data = this.read();
        if (!data.parents) data.parents = [];
        
        // Check if already exists
        var exists = data.parents.find(function(p) { return p.id === parentData.id; });
        if (!exists) {
            data.parents.push(parentData);
        }
        
        return this.write(data);
    },
    
    // Update parent
    updateParent(id, updates) {
        var data = this.read();
        if (!data.parents) data.parents = [];
        
        var index = data.parents.findIndex(function(p) { return p.id === id; });
        if (index !== -1) {
            data.parents[index] = Object.assign({}, data.parents[index], updates);
            return this.write(data);
        }
        return false;
    },
    
    // Delete parent
    deleteParent(id) {
        var data = this.read();
        if (!data.parents) data.parents = [];
        
        data.parents = data.parents.filter(function(p) { return p.id !== id; });
        return this.write(data);
    },
    
    // Get all parents
    getAllParents() {
        var data = this.read();
        return data.parents || [];
    },
    
    // Get parent by ID
    getParentById(id) {
        var parents = this.getAllParents();
        return parents.find(function(p) { return p.id === id; }) || null;
    },
    
    // Get parent by email
    getParentByEmail(email) {
        var parents = this.getAllParents();
        return parents.find(function(p) {
            return p.email && p.email.toLowerCase() === email.toLowerCase();
        }) || null;
    },
    
    // Get statistics
    getStats() {
        var parents = this.getAllParents();
        var stats = {
            totalParents: parents.length,
            totalStudents: parents.reduce(function(sum, p) {
                return sum + (p.students ? p.students.length : 0);
            }, 0),
            studentsByLevel: {},
            parentsByMonth: {},
            recentParents: []
        };
        
        parents.forEach(function(p) {
            if (p.students) {
                p.students.forEach(function(s) {
                    var level = s.levelName || s.level;
                    stats.studentsByLevel[level] = (stats.studentsByLevel[level] || 0) + 1;
                });
            }
        });
        
        parents.forEach(function(p) {
            if (p.loginDate) {
                var month = p.loginDate.substring(0, 7);
                stats.parentsByMonth[month] = (stats.parentsByMonth[month] || 0) + 1;
            }
        });
        
        stats.recentParents = parents
            .sort(function(a, b) {
                return new Date(b.loginDate || 0) - new Date(a.loginDate || 0);
            })
            .slice(0, 10);
        
        return stats;
    },
    
    // Export to CSV
    exportCSV() {
        var parents = this.getAllParents();
        if (parents.length === 0) return null;
        
        var csv = 'الاسم,البريد الإلكتروني,رقم الهاتف,التلاميذ,المستوى,تاريخ التسجيل\n';
        
        parents.forEach(function(p) {
            var students = p.students ? p.students.map(function(s) {
                return s.name + ' (' + (s.levelName || s.level) + ')';
            }).join(' + ') : '';
            var levels = p.students ? p.students.map(function(s) {
                return s.levelName || s.level;
            }).join(' + ') : '';
            csv += '"' + p.name + '","' + (p.email || '') + '","' + (p.phone || '') + '","' + students + '","' + levels + '","' + (p.loginDate || '') + '"\n';
        });
        
        return csv;
    }
};
