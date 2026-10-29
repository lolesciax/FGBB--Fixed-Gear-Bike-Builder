import {test,expect,type Page} from '@playwright/test';
async function wheelScene(page:Page){return page.evaluate(async()=>{
 const url=performance.getEntriesByType('resource').find(e=>e.name.includes('/@react-three_fiber.js?'))!.name;
 const {_roots}=await import(url),s=_roots.get(document.querySelector('canvas')).store.getState(),root=s.scene.getObjectByName('bicycle_assembly');
 const front=root.getObjectByName('front_wheel'),rear=root.getObjectByName('rear_wheel');
 return {counts:[front.getObjectByName('laced_spokes').count,rear.getObjectByName('laced_spokes').count],lacing:[front.userData.lacing,rear.userData.lacing],unchanged:['shaped_padding','continuous_handlebar','crank_arm_1','rubber_section'].map(name=>root.getObjectByName(name).geometry.uuid),colors:['rim_profile','laced_spokes','hub_shell'].map(name=>front.getObjectByName(name).material.color.getHexString())};
});}
test('wheelset counts, lacing, drilling and coordinated finishes agree across both viewers and history',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/builder');
 await page.getByRole('button',{name:'Wheels',exact:true}).click();
 await page.getByRole('button',{name:'3D',exact:true}).click();await expect(page.locator('.bike3d-wrapper')).toHaveAttribute('data-loading','false');
 const original=await wheelScene(page);expect(original.counts).toEqual([32,32]);
 await page.getByRole('button',{name:'Select Deep section',exact:true}).click();
 await expect.poll(()=>wheelScene(page)).toMatchObject({counts:[32,32],unchanged:original.unchanged});
 await page.getByRole('button',{name:'Select Studio 20 / 24',exact:true}).click();
 await expect.poll(()=>wheelScene(page)).toMatchObject({counts:[20,24],lacing:['radial','two-cross']});
 await expect(page.locator('.product-option.selected [data-wheel-summary]')).toContainText('20F / 24R');
 await expect(page.locator('.product-option.selected [data-wheel-summary]')).toBeVisible();
 await page.getByLabel('Wheelset finish',{exact:true}).selectOption('pure-black');
 await expect.poll(async()=>(await wheelScene(page)).colors).toEqual(['202731','202731','202731']);
 await page.getByRole('button',{name:'2D',exact:true}).click();
 await expect(page.locator('[data-wheel="front"] [data-spoke]')).toHaveCount(20);await expect(page.locator('[data-wheel="rear"] [data-spoke]')).toHaveCount(24);
 await page.getByRole('button',{name:'Undo last selection',exact:true}).click();await page.getByRole('button',{name:'Undo last selection',exact:true}).click();
 await expect(page.locator('[data-wheel="front"] [data-spoke]')).toHaveCount(32);
 await page.getByRole('button',{name:'Redo selection',exact:true}).click();await expect(page.locator('[data-wheel="rear"] [data-spoke]')).toHaveCount(24);
});
