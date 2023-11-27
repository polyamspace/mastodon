import 'packs/public-path';
import { createRoot } from 'react-dom/client';

import ready from 'flavours/polyam/ready';

ready(() => {
  [].forEach.call(document.querySelectorAll('[data-admin-component]'), element => {
    const componentName  = element.getAttribute('data-admin-component');
    const { ...componentProps } = JSON.parse(element.getAttribute('data-props'));

    import('flavours/polyam/containers/admin_component').then(({ default: AdminComponent }) => {
      return import('flavours/polyam/components/admin/' + componentName).then(({ default: Component }) => {
        const root = createRoot(element);

        root.render (
          <AdminComponent>
            <Component {...componentProps} />
          </AdminComponent>,
        );
      });
    }).catch(error => {
      console.error(error);
    });
  });
});
