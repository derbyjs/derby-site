#!/usr/bin/env python
from fabric.api import task, env, run, local, sudo, put, execute
from fabric.context_managers import cd
from fabric.contrib.files import exists
from fabric.utils import error
from time import sleep
import sys

env.use_ssh_config = True
env.roledefs['stage'] = ['derbyjs-2.do.leverha.us']
env.roledefs['prod'] = ['derbyjs-1.do.leverha.us']

#env.user = 'deploy'

lever = {}
lever['repo_cache'] = '~/.deploy_repo_cache'
lever['image'] = 'lever/derbyjs'
lever['repository'] = 'https://github.com/derbyjs/derby-site.git'
lever['services'] = ['derbyjs/mongo', 'derbyjs/redis', 'derbyjs/derby-site']


# Setup tasks
@task
def bootstrap():
    '''Places upstart and varnish configs, reload varnish'''
    if not exists('/etc/varnish'):
        error('Varnish is not installed. Has this host been chef bootstrapped with the "derbyjs-com" role?')
    put('varnish/*', remote_path='/etc/varnish/', use_sudo=True)
    sudo('mkdir -p /etc/init/derbyjs')
    put('init/*', remote_path='/etc/init/derbyjs/', use_sudo=True)
    sudo('service varnish reload')


# Build/deploy tasks
@task
def tag(tag):
    '''Tag the current HEAD, pushes tags to origin'''
    local('git tag %s')
    local('git push origin --tags')


def initctl(action=None, service=None):
    '''Control upstart services'''
    if action not in ['start', 'stop', 'status']:
        print "Must provide a valid action to initctl() (start, stop, status)"
        sys.exit(1)

    if service is None:
        services = lever['services']
    else:
        services = [service]

    for svc in services:
        sudo('%s %s' % (action, svc), warn_only=True)


@task
def start():
    '''Start derby-examples AND dependent services (redis, mongo)'''
    initctl('start')


@task
def stop():
    '''Stop derby-examples AND dependent services (redis, mongo)'''
    initctl('stop')


@task
def deploy(tag):
    '''Pull latest master from origin, build new docker image, restart derby-site services'''
    # TODO Start redis/mongo services if not running
    if not exists('%s/%s' % (lever['repo_cache'], 'derby-site')):
        execute(clone)
    with cd('%s/derby-site' % (lever['repo_cache'])):
        #run('git fetch')
        #run('git reset --hard %s' % tag)
        run('git pull -r')
        run('docker build -t derbyjs/derby-site .')

    sleep(2)

    # Ensure dependent services running
    execute(start)

    # Proper restart
    sudo('stop derbyjs/derby-site', warn_only=True)
    sudo('start derbyjs/derby-site')


def clone():
    if not exists(lever['repo_cache']):
        run('mkdir %s' % lever['repo_cache'])
    with cd(lever['repo_cache']):
        run('git clone %s' % lever['repository'])
