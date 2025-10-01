                                module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'build', // Cambios en build o dependencias
        'chore', // Tareas de mantenimiento
        'ci', // Cambios en CI/CD
        'docs', // Documentación
        'feat', // Nueva funcionalidad
        'fix', // Corrección de bugs
        'hotfix', // Corrección urgente en producción
        'merge', // Integración de ramas y resolución de conflictos
        'perf', // Mejoras de rendimiento
        'refactor', // Refactoring sin cambio funcional
        'release', // Preparación de release
        'revert', // Revertir commits
        'security', // Correcciones de seguridad
        'style', // Cambios de formato (espacios, etc)
        'test', // Agregar o corregir tests
        'update', // Actualización de dependencias
        'wip', // Work in progress (solo en desarrollo)
      ],
    ],
    'scope-enum': [
      2,
      'always',
      [
        // Scopes de aplicaciones
        'corporate', // website-corporate
        'marketing', // website-erp-marketing
        'erp', // app-erp
        // Scopes de infraestructura
        'monorepo', // Cambios que afectan todo el monorepo
        'deps', // Dependencias
        'config', // Configuración
        'docs', // Documentación
        'ci', // CI/CD
        'workspace', // Workspace configuration
        // Scopes funcionales
        'auth', // Autenticación
        'ui', // Componentes UI
        'api', // APIs
        'db', // Base de datos
        'utils', // Utilidades
        'types', // Tipos TypeScript
        'hooks', // React hooks
        'context', // React context
        'services', // Servicios
        'components', // Componentes
        'pages', // Páginas
        'assets', // Assets (imágenes, iconos, etc)
        'styles', // Estilos
      ],
    ],
    'scope-case': [2, 'always', 'lower-case'],
    'subject-case': [2, 'never', ['start-case', 'pascal-case', 'upper-case']],
    'subject-max-length': [2, 'always', 100],
    'subject-min-length': [2, 'always', 3],
    'body-max-line-length': [2, 'always', 100],
    'header-max-length': [2, 'always', 100],
    'type-case': [2, 'always', 'lower-case'],
    'scope-empty': [1, 'never'],
  }
};
