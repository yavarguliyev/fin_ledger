import { THEME } from '../../constants/ui/theme.constant';
import { StoredThemeDto } from '../../interfaces/ui/stored-theme.interface';
import { Theme } from '../../types/ui/theme.type';

export class ThemeHelper {
  static initial ({ stored }: StoredThemeDto): Theme {
    return stored === THEME.DARK || stored === THEME.LIGHT ? stored : THEME.DEFAULT;
  }
}
