import { asyncRouterMap, constantRouterMap } from '@/router'
import { fetchUserTree } from '@/api/menu'

/**
 * 动态权限判断
 * @param menuIds 用户拥有的菜单列表
 * @param route 路由菜单表
 */
function hasPermission(menuIds, route) {
  let result = false
  menuIds.filter(menuId => {
    if (menuId === route.menuId) {
      result = true
    }
  })
  return result
}

/**
 * 递归过滤异步路由表，返回符合用户角色权限的路由表
 * @param asyncRouterMap
 * @param menuIds
 */
function filterAsyncRouter(asyncRouterMap, menuIds) {
  const accessedRouters = asyncRouterMap.filter(route => {
    if (hasPermission(menuIds, route)) {
      if (route.children && route.children.length) {
        route.children = filterAsyncRouter(route.children, menuIds)
      }
      return true
    }
    return false
  })
  return accessedRouters
}

const permission = {
  state: {
    routers: constantRouterMap,
    addRouters: []
  },
  mutations: {
    SET_ROUTERS: (state, routers) => {
      state.addRouters = routers
      state.routers = constantRouterMap.concat(routers)
    }
  },
  actions: {
    GenerateRoutes({ commit }, data) {
      return new Promise(resolve => {
        const { roles } = data
        let accessedRouters
        fetchUserTree().then(res => {
          if (roles.indexOf('ROLE_ADMIN') >= 0) {
            accessedRouters = asyncRouterMap
          } else {
            accessedRouters = filterAsyncRouter(asyncRouterMap, res.data)
          }
          commit('SET_ROUTERS', accessedRouters)
          resolve()
        })
      })
    }
  }
}

export default permission
