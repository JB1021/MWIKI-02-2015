from fabric.operations import local
from fabric.api import execute
from time import time

release_path="/root"
clone_uri="https://github.com/JB1021/MWIKI-02-2015.git"
deploy_dir="MWIKI-02-2015"
current_release=""
maintainance_config="/etc/nginx/sites-available-backup/maintainance.com"
backup_config="/etc/nginx/sites-available-backup/mwiki.com"
service_config="/etc/nginx/sites-available/mwiki.com"

def nginxRestart():
        local('sudo service nginx stop')
        local('sudo service nginx start')

def mkReleaseDir():
        global current_release
        current_release = "%(release_path)s/%(time).0f" % { 'release_path':release_path, 'time':time() }
        local("sudo mkdir %(current_release)s" % {'current_release':current_release})

def gitClone():
        global current_release
        local("cd %(current_release)s\n git clone %(clone_uri)s" %{'current_release':current_release, 'clone_uri':clone_uri})

def npmInstall():
        global current_release
        local('cd %(current_release)s/%(deploy_dir)s; npm install' %{'current_release':current_release, 'deploy_dir':deploy_dir})

def nodeRestart():
        global current_release
        local('pm2 stop all')
        local('pm2 delete all')
        local('cd %(current_release)s/%(deploy_dir)s/bin; pm2 start www --name "mwiki"' %{'current_release':current_release, 'deploy_dir': deploy_dir})

def cpDbConfig():
        global current_release
        local('cp %(release_path)s/%(deploy_dir)s/routes/dbConfig.json %(current_release)s/%(deploy_dir)s/routes/dbConfig.json' %{'current_release':current_release, 'deploy_dir': deploy_dir, 'release_path':release_path})

def maintainancePage():
        local('\cp %(maintainance)s %(service)s' %{'maintainance':maintainance_config, 'service':service_config})

def servicePage():
        local('\cp %(backup)s %(service)s' %{'backup':backup_config, 'service':service_config})

def deploy():
        execute(mkReleaseDir)
        execute(gitClone)
        execute(npmInstall)
        execute(cpDbConfig)
        execute(maintainancePage)
        execute(nginxRestart)
        execute(nodeRestart)
        execute(servicePage)
        execute(nginxRestart)
