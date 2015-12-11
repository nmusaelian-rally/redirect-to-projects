Ext.define('CustomApp', {
    extend: 'Rally.app.App',
    componentCls: 'app',
    launch: function() {
        this.getProjects();
    },
    getProjects:function(){
        var projects = Ext.create('Rally.data.wsapi.Store', {
            model: 'Project',
            fetch: ['ObjectID', 'Children', 'Parent', 'Name'],
            limit:Infinity,
            compact:false,
            context:{
                    workspace: this.getContext().getWorkspace()._ref,
                    project:null //returns all projects
            }
        });
        projects.load().then({
            success: this.loadChildren,
            scope: this
        }).then({
            success: function(results) {
                var myProjects = [];
                _.each(results, function(result){
                    _.each(result, function(project){
                        myProjects.push({
                            'ref'           :   project.data._ref,
                            'id'            :   project.data.ObjectID,
                            'name'          :   project.data.Name,
                            'parent'        :   project.data.Parent && project.data.Parent._refObjectName || 'None',
                            'childrenCount' :   project.data.Children.Count
                        });
                    });
                });
                this.redirect(myProjects);

            },
            failure: function(error) {
                console.log('oh noes!', error);
            },
            scope:this
        });
    },
    
    loadChildren: function(projects) {
        var promises = [];
        _.each(projects, function(project) {
            var children = project.get('Children');
            if(children.Count > 0) {
                children.store = project.getCollection('Children',{fetch:['ObjectID', 'Children', 'Parent', 'Name'], compact:false});
                promises.push(children.store.load());
            }
        });
        return Deft.Promise.all(promises);
    },
    
    redirect:function(projects){
        console.log("redirect");
        var page = '/userstories';
        this.add(
            {
                xtype: 'container',
                items: _.map(projects, function(project){
                    return {
                        xtype: 'container',
                        html:  '<a href="https://rally1.rallydev.com/#/' + project.id + 'ud' + page + '" target = "_blank">' + project.name + '</a><p>'
                    };
            })
            }); 
    }
   
});
