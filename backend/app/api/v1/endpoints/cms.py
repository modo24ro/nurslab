from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.models.cms import CMSSection, CMSContentBlock, NavigationItem, SiteSetting
from app.schemas.cms import (
    CMSSectionResponse, CMSSectionUpdate,
    CMSContentBlockResponse, CMSContentBlockUpdate,
    NavigationItemResponse, NavigationItemUpdate,
    SiteSettingResponse
)
from app.api.deps import get_current_admin

router = APIRouter()

@router.get("/public")
async def get_public_cms_data(db: AsyncSession = Depends(get_db)):
    # Fetch visible sections ordered
    sections_res = await db.execute(
        select(CMSSection).where(CMSSection.is_visible == True).order_by(CMSSection.display_order)
    )
    sections = sections_res.scalars().all()

    # Fetch active blocks
    blocks_res = await db.execute(
        select(CMSContentBlock).where(CMSContentBlock.is_active == True).order_by(CMSContentBlock.display_order)
    )
    blocks = blocks_res.scalars().all()

    # Group blocks by section_key
    blocks_by_section: Dict[str, List[CMSContentBlockResponse]] = {}
    for b in blocks:
        blocks_by_section.setdefault(b.section_key, []).append(CMSContentBlockResponse.model_validate(b))

    formatted_sections = []
    for s in sections:
        sec_dict = CMSSectionResponse.model_validate(s).model_dump()
        sec_dict["blocks"] = blocks_by_section.get(s.section_key, [])
        formatted_sections.append(sec_dict)

    # Fetch visible navigation items
    nav_res = await db.execute(
        select(NavigationItem).where(NavigationItem.is_visible == True).order_by(NavigationItem.order_index)
    )
    nav_items = [NavigationItemResponse.model_validate(item) for item in nav_res.scalars().all()]

    # Fetch site settings
    settings_res = await db.execute(select(SiteSetting))
    settings_dict = {st.setting_key: st.setting_value for st in settings_res.scalars().all()}

    return {
        "sections": formatted_sections,
        "navigation": nav_items,
        "settings": settings_dict,
    }

@router.get("/navigation", response_model=List[NavigationItemResponse])
async def get_navigation_items(db: AsyncSession = Depends(get_db)):
    res = await db.execute(select(NavigationItem).order_by(NavigationItem.order_index))
    return [NavigationItemResponse.model_validate(item) for item in res.scalars().all()]

@router.put("/navigation/{nav_id}", response_model=NavigationItemResponse)
async def update_navigation_item(
    nav_id: str,
    data: NavigationItemUpdate,
    db: AsyncSession = Depends(get_db),
    admin = Depends(get_current_admin)
):
    res = await db.execute(select(NavigationItem).where(NavigationItem.id == nav_id))
    item = res.scalar_one_or_none()
    if not item:
        raise HTTPException(status_code=404, detail="Element navigare inexistent")

    for k, v in data.model_dump(exclude_unset=True).items():
        setattr(item, k, v)
    await db.commit()
    await db.refresh(item)
    return NavigationItemResponse.model_validate(item)

@router.get("/sections", response_model=List[CMSSectionResponse])
async def get_all_sections(db: AsyncSession = Depends(get_db), admin = Depends(get_current_admin)):
    res = await db.execute(select(CMSSection).order_by(CMSSection.display_order))
    sections = res.scalars().all()

    blocks_res = await db.execute(select(CMSContentBlock).order_by(CMSContentBlock.display_order))
    blocks = blocks_res.scalars().all()

    blocks_by_sec: Dict[str, List[CMSContentBlockResponse]] = {}
    for b in blocks:
        blocks_by_sec.setdefault(b.section_key, []).append(CMSContentBlockResponse.model_validate(b))

    result = []
    for s in sections:
        sec_obj = CMSSectionResponse.model_validate(s)
        sec_obj.blocks = blocks_by_sec.get(s.section_key, [])
        result.append(sec_obj)
    return result

@router.put("/sections/{section_key}", response_model=CMSSectionResponse)
async def update_cms_section(
    section_key: str,
    update_in: CMSSectionUpdate,
    db: AsyncSession = Depends(get_db),
    admin = Depends(get_current_admin)
):
    res = await db.execute(select(CMSSection).where(CMSSection.section_key == section_key))
    section = res.scalar_one_or_none()
    if not section:
        raise HTTPException(status_code=404, detail="Secțiune inexistentă")

    for k, v in update_in.model_dump(exclude_unset=True).items():
        setattr(section, k, v)
    await db.commit()
    await db.refresh(section)
    return CMSSectionResponse.model_validate(section)

@router.put("/blocks/{block_id}", response_model=CMSContentBlockResponse)
async def update_cms_block(
    block_id: str,
    update_in: CMSContentBlockUpdate,
    db: AsyncSession = Depends(get_db),
    admin = Depends(get_current_admin)
):
    res = await db.execute(select(CMSContentBlock).where(CMSContentBlock.id == block_id))
    block = res.scalar_one_or_none()
    if not block:
        raise HTTPException(status_code=404, detail="Bloc de conținut inexistent")

    for k, v in update_in.model_dump(exclude_unset=True).items():
        setattr(block, k, v)
    await db.commit()
    await db.refresh(block)
    return CMSContentBlockResponse.model_validate(block)
